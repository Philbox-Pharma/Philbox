import Order from '../../../../../models/Order.js';
import Transaction from '../../../../../models/Transaction.js';
import Appointment from '../../../../../models/Appointment.js';
import Doctor from '../../../../../models/Doctor.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Medicine from '../../../../../models/Medicine.js';
import CustomerActivityLog from '../../../../../models/CustomerActivityLog.js';

/**
 * Report Generation Service
 * Handles generation of various business reports
 */
class ReportGenerationService {
  /**
   * Generate Sales Report
   * Retrieves sales data for a specified date range
   */
  async generateSalesReport(filters) {
    const { date_from, date_to, branch_id } = filters;

    // Build query
    const query = {
      created_at: {
        $gte: new Date(date_from),
        $lte: new Date(date_to),
      },
    };

    if (branch_id) {
      query.branch_id = branch_id;
    }

    // Fetch orders
    const orders = await Order.find(query)
      .populate('customer_id', 'fullName email')
      .populate('branch_id', 'name')
      .lean();

    // Fetch transactions
    const transactions = await Transaction.find({
      created_at: {
        $gte: new Date(date_from),
        $lte: new Date(date_to),
      },
      payment_status: 'successful',
    }).lean();

    // Calculate metrics
    const totalSales = transactions.reduce(
      (sum, t) => sum + (t.total_bill || 0),
      0
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group by payment method
    const paymentMethodBreakdown = {};
    transactions.forEach(t => {
      const method = t.payment_method || 'Unknown';
      paymentMethodBreakdown[method] =
        (paymentMethodBreakdown[method] || 0) + (t.total_bill || 0);
    });

    // Daily sales breakdown
    const dailySales = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + (order.total_amount || 0);
    });

    return {
      summary: {
        total_sales: totalSales,
        total_orders: totalOrders,
        average_order_value: averageOrderValue,
        payment_method_breakdown: paymentMethodBreakdown,
      },
      data: {
        orders: orders.slice(0, 100), // Limit to 100 for report
        daily_breakdown: dailySales,
      },
      total_records: totalOrders,
    };
  }

  /**
   * Generate Inventory Report
   * Shows current stock levels and low stock items
   */
  async generateInventoryReport(filters) {
    const { branch_id } = filters;

    // Build query
    const query = {};
    if (branch_id) {
      query.branch_id = branch_id;
    }

    // Fetch stock data
    const stocks = await StockInHand.find(query)
      .populate('medicine_id', 'Name generic_name strength')
      .populate('branch_id', 'name')
      .lean();

    // Fetch medicines for comparison
    const medicines = await Medicine.find().lean();

    // Calculate metrics
    const totalItems = stocks.length;
    const lowStockItems = stocks.filter(
      s => s.quantity < (s.reorder_point || 20)
    );
    const outOfStockItems = stocks.filter(s => s.quantity === 0);
    const totalValue = stocks.reduce((sum, s) => {
      const medicine = medicines.find(
        m => m._id.toString() === s.medicine_id._id?.toString()
      );
      return sum + (medicine?.sale_price || 0) * s.quantity;
    }, 0);

    return {
      summary: {
        total_medicines: totalItems,
        low_stock_count: lowStockItems.length,
        out_of_stock_count: outOfStockItems.length,
        total_inventory_value: totalValue,
      },
      data: {
        all_stocks: stocks,
        low_stock_items: lowStockItems,
        out_of_stock_items: outOfStockItems,
      },
      total_records: totalItems,
    };
  }

  /**
   * Generate Appointment Report
   * Shows appointment statistics and performance
   */
  async generateAppointmentReport(filters) {
    const { date_from, date_to, branch_id } = filters;

    // Build query
    const query = {
      created_at: {
        $gte: new Date(date_from),
        $lte: new Date(date_to),
      },
    };

    if (branch_id) {
      query.branch_id = branch_id;
    }

    // Fetch appointments
    const appointments = await Appointment.find(query)
      .populate('doctor_id', 'fullName specialization')
      .populate('patient_id', 'first_name last_name')
      .lean();

    // Calculate metrics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(
      a => a.appointment_status === 'completed'
    ).length;
    const cancelledAppointments = appointments.filter(
      a => a.appointment_status === 'cancelled'
    ).length;
    const noShowAppointments = appointments.filter(a => a.no_show).length;

    // Group by doctor
    const appointmentsByDoctor = {};
    appointments.forEach(apt => {
      const doctorName = apt.doctor_id?.fullName || 'Unknown';
      if (!appointmentsByDoctor[doctorName]) {
        appointmentsByDoctor[doctorName] = {
          count: 0,
          completed: 0,
          cancelled: 0,
        };
      }
      appointmentsByDoctor[doctorName].count++;
      if (apt.appointment_status === 'completed') {
        appointmentsByDoctor[doctorName].completed++;
      } else if (apt.appointment_status === 'cancelled') {
        appointmentsByDoctor[doctorName].cancelled++;
      }
    });

    const completionRate =
      totalAppointments > 0
        ? (completedAppointments / totalAppointments) * 100
        : 0;

    return {
      summary: {
        total_appointments: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        no_show: noShowAppointments,
        completion_rate: completionRate.toFixed(2),
      },
      data: {
        appointments: appointments.slice(0, 100),
        by_doctor: appointmentsByDoctor,
      },
      total_records: totalAppointments,
    };
  }

  /**
   * Generate Doctor Performance Report
   * Shows doctor metrics and performance indicators
   */
  async generateDoctorPerformanceReport(filters) {
    const { date_from, date_to, branch_id } = filters;

    // Fetch all doctors
    let doctors = await Doctor.find().populate('branch_id', 'name').lean();

    if (branch_id) {
      doctors = doctors.filter(d => d.branch_id?._id?.toString() === branch_id);
    }

    // For each doctor, calculate performance metrics
    const doctorMetrics = await Promise.all(
      doctors.map(async doctor => {
        // Get appointments
        const appointments = await Appointment.find({
          doctor_id: doctor._id,
          created_at: {
            $gte: new Date(date_from),
            $lte: new Date(date_to),
          },
        }).lean();

        const completedAppointments = appointments.filter(
          a => a.appointment_status === 'completed'
        ).length;
        const totalAppointments = appointments.length;
        const completionRate =
          totalAppointments > 0
            ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
            : 0;

        // Get average rating from reviews (if applicable)
        const avgRating = doctor.average_rating || 0;

        return {
          doctor_id: doctor._id,
          doctor_name: doctor.fullName,
          specialization: doctor.specialization,
          branch: doctor.branch_id?.name || 'Unknown',
          total_appointments: totalAppointments,
          completed_appointments: completedAppointments,
          completion_rate: completionRate,
          average_rating: avgRating,
        };
      })
    );

    const totalDoctors = doctorMetrics.length;
    const avgCompletionRate = (
      doctorMetrics.reduce(
        (sum, d) => sum + parseFloat(d.completion_rate || 0),
        0
      ) / (totalDoctors || 1)
    ).toFixed(2);

    return {
      summary: {
        total_doctors: totalDoctors,
        average_completion_rate: avgCompletionRate,
        avg_rating_across_doctors: (
          doctorMetrics.reduce((sum, d) => sum + (d.average_rating || 0), 0) /
          (totalDoctors || 1)
        ).toFixed(2),
      },
      data: {
        doctors: doctorMetrics,
      },
      total_records: totalDoctors,
    };
  }

  /**
   * Generate Customer Activity Report
   * Shows customer behavior and engagement metrics
   */
  async generateCustomerActivityReport(filters) {
    const { date_from, date_to } = filters;

    // Get customer activity logs
    const activityLogs = await CustomerActivityLog.find({
      created_at: {
        $gte: new Date(date_from),
        $lte: new Date(date_to),
      },
    })
      .populate('customer_id', 'fullName email phone_number')
      .lean();

    // Get customer orders
    const orders = await Order.find({
      created_at: {
        $gte: new Date(date_from),
        $lte: new Date(date_to),
      },
    }).lean();

    // Get unique customers
    const uniqueCustomerIds = new Set(
      activityLogs.map(log => log.customer_id._id.toString())
    );
    const uniqueCustomers = uniqueCustomerIds.size;

    // Activity breakdown
    const activityBreakdown = {};
    activityLogs.forEach(log => {
      const action = log.action_type || 'Unknown';
      activityBreakdown[action] = (activityBreakdown[action] || 0) + 1;
    });

    // Customer order metrics
    const customerMetrics = {};
    orders.forEach(order => {
      const customerId = order.customer_id?.toString() || 'Unknown';
      if (!customerMetrics[customerId]) {
        customerMetrics[customerId] = { orders: 0, total_spent: 0 };
      }
      customerMetrics[customerId].orders++;
      customerMetrics[customerId].total_spent += order.total_amount || 0;
    });

    const topCustomers = Object.entries(customerMetrics)
      .map(([id, metrics]) => ({ customer_id: id, ...metrics }))
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 20);

    return {
      summary: {
        total_activity_logs: activityLogs.length,
        unique_customers: uniqueCustomers,
        total_orders: orders.length,
        average_orders_per_customer:
          uniqueCustomers > 0
            ? (orders.length / uniqueCustomers).toFixed(2)
            : 0,
        activity_breakdown: activityBreakdown,
      },
      data: {
        top_customers: topCustomers,
        detailed_logs: activityLogs.slice(0, 100),
      },
      total_records: activityLogs.length,
    };
  }
}

export default new ReportGenerationService();
