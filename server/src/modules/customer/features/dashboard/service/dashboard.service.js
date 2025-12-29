import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import Appointment from '../../../../../models/Appointment.js';
import MedicineItem from '../../../../../models/MedicineItem.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerDashboardService {
  /**
   * Get complete dashboard data for customer
   */
  async getDashboardData(customerId, req) {
    try {
      // 1. Get Quick Stats
      const stats = await this.getQuickStats(customerId);

      // 2. Get Recent Orders (last 5)
      const recentOrders = await this.getRecentOrders(customerId);

      // 3. Get Upcoming Appointments (next 3)
      const upcomingAppointments =
        await this.getUpcomingAppointments(customerId);

      // 4. Get Medicine Recommendations (based on past orders)
      const medicineRecommendations =
        await this.getMedicineRecommendations(customerId);

      // Log activity
      await logCustomerActivity(
        req,
        'view_dashboard',
        'Viewed dashboard',
        'customers',
        customerId
      );

      return {
        stats,
        recentOrders,
        upcomingAppointments,
        medicineRecommendations,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get quick stats: total orders and upcoming appointments count
   */
  async getQuickStats(customerId) {
    // Count total orders
    const totalOrders = await Order.countDocuments({ customer_id: customerId });

    // Count upcoming appointments (pending or in-progress)
    const upcomingAppointmentsCount = await Appointment.countDocuments({
      patient_id: customerId,
      status: { $in: ['pending', 'in-progress'] },
      appointment_request: 'accepted',
    });

    return {
      totalOrders,
      upcomingAppointments: upcomingAppointmentsCount,
    };
  }

  /**
   * Get recent orders (last 5) with order items
   */
  async getRecentOrders(customerId) {
    const orders = await Order.find({ customer_id: customerId })
      .sort({ created_at: -1 })
      .limit(5)
      .populate({
        path: 'order_items',
        populate: {
          path: 'medicine_id',
          select: 'Name img_url sale_price',
        },
      })
      .populate('branch_id', 'name address')
      .lean();

    return orders.map(order => ({
      _id: order._id,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
      delivery_charges: order.delivery_charges,
      branch: order.branch_id,
      items:
        order.order_items?.map(item => ({
          medicine: item.medicine_id,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })) || [],
      itemCount: order.order_items?.length || 0,
    }));
  }

  /**
   * Get upcoming appointments (next 3) with doctor info
   */
  async getUpcomingAppointments(customerId) {
    const appointments = await Appointment.find({
      patient_id: customerId,
      status: { $in: ['pending', 'in-progress'] },
      appointment_request: 'accepted',
    })
      .sort({ created_at: 1 })
      .limit(3)
      .populate('doctor_id', 'fullName specialization profile_img_url')
      .populate('slot_id', 'date start_time end_time')
      .lean();

    return appointments.map(apt => ({
      _id: apt._id,
      doctor: apt.doctor_id,
      slot: apt.slot_id,
      status: apt.status,
      appointment_type: apt.appointment_type,
      created_at: apt.created_at,
    }));
  }

  /**
   * Get medicine recommendations based on frequently ordered medicines
   */
  async getMedicineRecommendations(customerId) {
    // Get all orders by this customer
    const customerOrders = await Order.find({ customer_id: customerId })
      .select('order_items')
      .lean();

    if (!customerOrders || customerOrders.length === 0) {
      // No orders yet, return some popular medicines
      return await MedicineItem.find()
        .sort({ created_at: -1 })
        .limit(5)
        .select('Name img_url sale_price description mgs')
        .lean();
    }

    // Get all order items from these orders
    const orderItemIds = customerOrders.flatMap(
      order => order.order_items || []
    );

    if (orderItemIds.length === 0) {
      return await MedicineItem.find()
        .sort({ created_at: -1 })
        .limit(5)
        .select('Name img_url sale_price description mgs')
        .lean();
    }

    const orderItems = await OrderItem.find({ _id: { $in: orderItemIds } })
      .select('medicine_id')
      .lean();

    // Count frequency of each medicine
    const medicineFrequency = {};
    orderItems.forEach(item => {
      const medId = item.medicine_id?.toString();
      if (medId) {
        medicineFrequency[medId] = (medicineFrequency[medId] || 0) + 1;
      }
    });

    // Sort by frequency and get top medicine IDs
    const topMedicineIds = Object.entries(medicineFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([medId]) => medId);

    // Fetch medicine details
    const medicines = await MedicineItem.find({ _id: { $in: topMedicineIds } })
      .select('Name img_url sale_price description mgs')
      .lean();

    return medicines;
  }
}

export default new CustomerDashboardService();
