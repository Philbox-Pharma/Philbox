import Appointment from '../../../../../models/Appointment.js';
import Doctor from '../../../../../models/Doctor.js';
import DailyAppointmentsAnalytics from '../../../../../models/DailyAppointmentsAnalytics.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';

class AppointmentAnalyticsService {
  /**
   * Get Appointment Trends (Daily/Weekly/Monthly)
   */
  async getAppointmentTrends(query, req) {
    try {
      const { startDate, endDate, period = 'daily' } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      const end = endDate ? new Date(endDate) : new Date();

      // Build match filter
      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      // Group by period
      let groupBy;
      if (period === 'daily') {
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          day: { $dayOfMonth: '$created_at' },
        };
      } else if (period === 'weekly') {
        groupBy = {
          year: { $year: '$created_at' },
          week: { $week: '$created_at' },
        };
      } else {
        // monthly
        groupBy = {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
        };
      }

      const trends = await Appointment.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupBy,
            totalAppointments: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            missed: {
              $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      ]);

      // Log activity
      await logAdminActivity(
        req,
        'view_appointment_trends',
        `Viewed appointment trends (${period})`,
        'appointment_analytics',
        null
      );

      return { trends, period, startDate: start, endDate: end };
    } catch (error) {
      console.error('Error in getAppointmentTrends:', error);
      throw error;
    }
  }

  /**
   * Get Completion vs Missed Rate
   */
  async getCompletionMissedRate(query, req) {
    try {
      const { startDate, endDate } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      const stats = await Appointment.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            missed: {
              $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] },
            },
          },
        },
      ]);

      const result = stats[0] || { total: 0, completed: 0, missed: 0 };
      const completionRate =
        result.total > 0
          ? ((result.completed / result.total) * 100).toFixed(2)
          : 0;
      const missedRate =
        result.total > 0
          ? ((result.missed / result.total) * 100).toFixed(2)
          : 0;

      await logAdminActivity(
        req,
        'view_completion_rate',
        'Viewed completion vs missed rate',
        'appointment_analytics',
        null
      );

      return {
        completed: result.completed,
        missed: result.missed,
        total: result.total,
        completionRate: parseFloat(completionRate),
        missedRate: parseFloat(missedRate),
      };
    } catch (error) {
      console.error('Error in getCompletionMissedRate:', error);
      throw error;
    }
  }

  /**
   * Get Top Doctors by Appointments
   */
  async getTopDoctorsByAppointments(query, req) {
    try {
      const { startDate, endDate, limit = 5 } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
        status: { $in: ['completed', 'in-progress'] },
      };

      const topDoctors = await Appointment.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$doctor_id',
            totalAppointments: { $sum: 1 },
          },
        },
        { $sort: { totalAppointments: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $project: {
            _id: 1,
            totalAppointments: 1,
            doctorName: '$doctor.fullName',
            doctorEmail: '$doctor.email',
            specialization: '$doctor.specialization',
            profileImage: '$doctor.profile_img_url',
          },
        },
      ]);

      await logAdminActivity(
        req,
        'view_top_doctors_appointments',
        'Viewed top doctors by appointments',
        'appointment_analytics',
        null
      );

      return topDoctors;
    } catch (error) {
      console.error('Error in getTopDoctorsByAppointments:', error);
      throw error;
    }
  }

  /**
   * Get Top Doctors by Revenue
   */
  async getTopDoctorsByRevenue(query, req) {
    try {
      const { startDate, endDate, limit = 5 } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
        status: 'completed', // Only count completed appointments for revenue
      };

      const topDoctors = await Appointment.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $group: {
            _id: '$doctor_id',
            totalRevenue: { $sum: '$doctor.consultation_fee' },
            totalAppointments: { $sum: 1 },
            doctorName: { $first: '$doctor.fullName' },
            doctorEmail: { $first: '$doctor.email' },
            specialization: { $first: '$doctor.specialization' },
            profileImage: { $first: '$doctor.profile_img_url' },
            consultationFee: { $first: '$doctor.consultation_fee' },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: parseInt(limit) },
      ]);

      await logAdminActivity(
        req,
        'view_top_doctors_revenue',
        'Viewed top doctors by revenue',
        'appointment_analytics',
        null
      );

      return topDoctors;
    } catch (error) {
      console.error('Error in getTopDoctorsByRevenue:', error);
      throw error;
    }
  }

  /**
   * Get Appointment Types Distribution (In-person vs Online)
   */
  async getAppointmentTypesDistribution(query, req) {
    try {
      const { startDate, endDate } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
      };

      const distribution = await Appointment.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$appointment_type',
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        'in-person': 0,
        online: 0,
        total: 0,
      };

      distribution.forEach(item => {
        result[item._id] = item.count;
        result.total += item.count;
      });

      result.inPersonPercentage =
        result.total > 0
          ? ((result['in-person'] / result.total) * 100).toFixed(2)
          : 0;
      result.onlinePercentage =
        result.total > 0
          ? ((result.online / result.total) * 100).toFixed(2)
          : 0;

      await logAdminActivity(
        req,
        'view_appointment_types',
        'Viewed appointment types distribution',
        'appointment_analytics',
        null
      );

      return result;
    } catch (error) {
      console.error('Error in getAppointmentTypesDistribution:', error);
      throw error;
    }
  }

  /**
   * Get Average Appointment Revenue (KPI)
   */
  async getAverageRevenue(query, req) {
    try {
      const { startDate, endDate } = query;

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchFilter = {
        created_at: { $gte: start, $lte: end },
        status: 'completed',
      };

      const revenue = await Appointment.aggregate([
        { $match: matchFilter },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$doctor.consultation_fee' },
            totalAppointments: { $sum: 1 },
          },
        },
      ]);

      const result = revenue[0] || { totalRevenue: 0, totalAppointments: 0 };
      const averageRevenue =
        result.totalAppointments > 0
          ? (result.totalRevenue / result.totalAppointments).toFixed(2)
          : 0;

      await logAdminActivity(
        req,
        'view_average_revenue',
        'Viewed average appointment revenue',
        'appointment_analytics',
        null
      );

      return {
        totalRevenue: result.totalRevenue,
        totalAppointments: result.totalAppointments,
        averageRevenue: parseFloat(averageRevenue),
      };
    } catch (error) {
      console.error('Error in getAverageRevenue:', error);
      throw error;
    }
  }

  /**
   * Get Dashboard Overview (All KPIs in one call)
   */
  async getDashboardOverview(query, req) {
    try {
      const [
        trends,
        completionRate,
        topDoctorsByAppointments,
        topDoctorsByRevenue,
        appointmentTypes,
        averageRevenue,
      ] = await Promise.all([
        this.getAppointmentTrends(query, req),
        this.getCompletionMissedRate(query, req),
        this.getTopDoctorsByAppointments(query, req),
        this.getTopDoctorsByRevenue(query, req),
        this.getAppointmentTypesDistribution(query, req),
        this.getAverageRevenue(query, req),
      ]);

      return {
        trends,
        completionRate,
        topDoctorsByAppointments,
        topDoctorsByRevenue,
        appointmentTypes,
        averageRevenue,
      };
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      throw error;
    }
  }

  /**
   * Aggregate appointment data for a specific date (background job)
   */
  async aggregateAppointmentData(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        created_at: { $gte: startOfDay, $lte: endOfDay },
      });

      const completed = appointments.filter(a => a.status === 'completed');
      const missed = appointments.filter(a => a.status === 'missed');
      const upcoming = appointments.filter(
        a => a.status === 'pending' || a.status === 'in-progress'
      );

      // Calculate rates
      const completionRate =
        appointments.length > 0
          ? (completed.length / appointments.length) * 100
          : 0;
      const noShowRate =
        appointments.length > 0
          ? (missed.length / appointments.length) * 100
          : 0;

      // Find top doctor by appointments
      const doctorAppointmentCounts = {};
      appointments.forEach(apt => {
        const docId = apt.doctor_id.toString();
        doctorAppointmentCounts[docId] =
          (doctorAppointmentCounts[docId] || 0) + 1;
      });

      const topDoctorByAppointments = Object.entries(
        doctorAppointmentCounts
      ).sort((a, b) => b[1] - a[1])[0]?.[0];

      // Calculate revenue per doctor
      const doctorRevenue = {};
      for (const apt of completed) {
        const doctor = await Doctor.findById(apt.doctor_id).select(
          'consultation_fee'
        );
        if (doctor) {
          const docId = apt.doctor_id.toString();
          doctorRevenue[docId] =
            (doctorRevenue[docId] || 0) + (doctor.consultation_fee || 0);
        }
      }

      const topDoctorByRevenue = Object.entries(doctorRevenue).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];

      const totalRevenue = Object.values(doctorRevenue).reduce(
        (sum, rev) => sum + rev,
        0
      );
      const averageCharge =
        completed.length > 0 ? totalRevenue / completed.length : 0;

      // Save or update daily analytics
      await DailyAppointmentsAnalytics.findOneAndUpdate(
        { date: startOfDay },
        {
          todays_appointments: appointments.map(a => a._id),
          completed_appointments: completed.map(a => a._id),
          missed_appointments: missed.map(a => a._id),
          upcoming_appointments: upcoming.map(a => a._id),
          completion_rate: completionRate,
          no_show_rate: noShowRate,
          top_doctor_by_appointments: topDoctorByAppointments,
          top_doctor_by_revenue: topDoctorByRevenue,
          total_revenue_today: totalRevenue,
          average_charge_per_appointment: averageCharge,
        },
        { upsert: true, new: true }
      );

      return {
        date: startOfDay,
        totalAppointments: appointments.length,
        completionRate,
        noShowRate,
        totalRevenue,
      };
    } catch (error) {
      console.error('Error in aggregateAppointmentData:', error);
      throw error;
    }
  }
}

export default new AppointmentAnalyticsService();
