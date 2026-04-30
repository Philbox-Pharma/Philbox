import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import Appointment from '../../../../../models/Appointment.js';
import Medicine from '../../../../../models/Medicine.js';
import Delivery from '../../../../../models/Delivery.js';
import SearchHistory from '../../../../../models/SearchHistory.js';
import MedicineCategory from '../../../../../models/MedicineCategory.js';
import Manufacturer from '../../../../../models/Manufacturer.js';
import Customer from '../../../../../models/Customer.js';
import MedicineCatalogService from '../../medicine_catalog/service/catalog.service.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerDashboardService {
  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _normalizeText(value = '') {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  _buildMedicineIdentityKey(medicine) {
    return [
      medicine?.Name,
      medicine?.alias_name,
      medicine?.mgs,
      medicine?.dosage_form,
      medicine?.manufacturer,
      medicine?.category,
    ]
      .map(value => this._normalizeText(value))
      .join('|');
  }

  _sanitizeRecommendationMedicine(medicine) {
    if (!medicine) return medicine;

    return {
      _id: medicine._id,
      Name: medicine.Name,
      alias_name: medicine.alias_name || null,
      img_urls: Array.isArray(medicine.img_urls) ? medicine.img_urls : [],
      sale_price: medicine.sale_price || 0,
      description: medicine.description || '',
      mgs: medicine.mgs || null,
      dosage_form: medicine.dosage_form || null,
      category: medicine.category || null,
      manufacturer: medicine.manufacturer || null,
      prescription_required: Boolean(medicine.prescription_required),
      active: Boolean(medicine.active),
    };
  }

  _extractFirstName(fullName = '') {
    const trimmed = String(fullName || '').trim();
    if (!trimmed) return 'Customer';
    return trimmed.split(/\s+/)[0] || 'Customer';
  }

  async _getRecentSearchQueries(customerId, limit = 10) {
    const searches = await SearchHistory.find({ customer_id: customerId })
      .sort({ searched_at: -1 })
      .select('query searched_at filters')
      .limit(Math.max(1, Math.min(Number(limit) || 10, 20)))
      .lean();

    const unique = [];
    const seen = new Set();

    for (const item of searches) {
      const query = String(item.query || '').trim();
      if (!query) continue;

      const key = query.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      unique.push(query);
    }

    return unique;
  }

  async _findMedicinesForSearchQuery(searchTerm, limit = 8) {
    const escapedQuery = this._escapeRegex(searchTerm);
    if (!escapedQuery) return [];

    const matchedCategories = await MedicineCategory.find({
      name: { $regex: escapedQuery, $options: 'i' },
    })
      .select('_id')
      .lean();

    const matchedManufacturers = await Manufacturer.find({
      name: { $regex: escapedQuery, $options: 'i' },
    })
      .select('_id')
      .lean();

    const query = {
      active: true,
      $or: [
        { Name: { $regex: escapedQuery, $options: 'i' } },
        { alias_name: { $regex: escapedQuery, $options: 'i' } },
        { mgs: { $regex: escapedQuery, $options: 'i' } },
        { dosage_form: { $regex: escapedQuery, $options: 'i' } },
      ],
    };

    if (matchedCategories.length) {
      query.$or.push({
        category: { $in: matchedCategories.map(item => item._id) },
      });
    }

    if (matchedManufacturers.length) {
      query.$or.push({
        manufacturer: { $in: matchedManufacturers.map(item => item._id) },
      });
    }

    return Medicine.find(query)
      .select(
        'Name alias_name img_urls sale_price description mgs dosage_form category manufacturer prescription_required active'
      )
      .sort({ createdAt: -1 })
      .limit(Math.max(1, Math.min(Number(limit) || 8, 12)))
      .lean();
  }

  async _getPurchasedMedicineIds(customerId, limit = 6) {
    const customerOrders = await Order.find({ customer_id: customerId })
      .select('order_items created_at')
      .sort({ created_at: -1 })
      .limit(15)
      .lean();

    if (!customerOrders.length) {
      return [];
    }

    const orderItemIds = customerOrders.flatMap(
      order => order.order_items || []
    );
    if (!orderItemIds.length) {
      return [];
    }

    const orderItems = await OrderItem.find({ _id: { $in: orderItemIds } })
      .select('medicine_id')
      .lean();

    const frequency = new Map();
    for (const item of orderItems) {
      const medicineId = String(item.medicine_id || '');
      if (!medicineId) continue;
      frequency.set(medicineId, (frequency.get(medicineId) || 0) + 1);
    }

    return [...frequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.max(1, Math.min(Number(limit) || 6, 10)))
      .map(([medicineId]) => medicineId);
  }

  async _getRecommendationSeedMedicines(customerId) {
    const searchQueries = await this._getRecentSearchQueries(customerId, 8);
    const purchasedMedicineIds = await this._getPurchasedMedicineIds(
      customerId,
      6
    );

    const searchMedicines = [];
    for (const query of searchQueries.slice(0, 5)) {
      const matches = await this._findMedicinesForSearchQuery(query, 4);
      searchMedicines.push(...matches);
    }

    const seedMap = new Map();

    for (const medicineId of purchasedMedicineIds) {
      seedMap.set(`purchase:${medicineId}`, medicineId);
    }

    for (const medicine of searchMedicines) {
      seedMap.set(`search:${medicine._id}`, String(medicine._id));
    }

    return {
      searchQueries,
      seedMedicineIds: [...seedMap.values()].slice(0, 8),
    };
  }

  async _getFallbackMedicines(limit = 5, excludedKeys = new Set()) {
    const medicines = await Medicine.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(Math.max(1, Math.min(Number(limit) || 5, 20)))
      .select(
        'Name alias_name img_urls sale_price description mgs dosage_form category manufacturer prescription_required active'
      )
      .lean();

    const fallback = [];
    for (const medicine of medicines) {
      const key = this._buildMedicineIdentityKey(medicine);
      if (excludedKeys.has(key)) continue;
      excludedKeys.add(key);
      fallback.push(this._sanitizeRecommendationMedicine(medicine));
      if (fallback.length >= limit) break;
    }

    return fallback;
  }

  _toStartOfDay(date = new Date()) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  _getUpcomingAppointmentBaseQuery(customerId) {
    return {
      patient_id: customerId,
      status: { $in: ['pending', 'in-progress'] },
      appointment_request: 'accepted',
    };
  }

  _isUpcomingAppointment(appointment) {
    if (!appointment) return false;

    if (appointment.appointment_request !== 'accepted') return false;
    if (!['pending', 'in-progress'].includes(appointment.status)) return false;

    const todayStart = this._toStartOfDay();
    const slotDate = appointment?.slot_id?.date
      ? new Date(appointment.slot_id.date)
      : null;

    if (slotDate && !Number.isNaN(slotDate.getTime())) {
      return this._toStartOfDay(slotDate).getTime() >= todayStart.getTime();
    }

    const preferredDate = appointment?.preferred_date
      ? new Date(appointment.preferred_date)
      : null;

    if (preferredDate && !Number.isNaN(preferredDate.getTime())) {
      return (
        this._toStartOfDay(preferredDate).getTime() >= todayStart.getTime()
      );
    }

    return false;
  }

  _getAppointmentSortTime(appointment) {
    const slotDate = appointment?.slot_id?.date
      ? new Date(appointment.slot_id.date)
      : null;

    if (slotDate && !Number.isNaN(slotDate.getTime())) {
      return slotDate.getTime();
    }

    const preferredDate = appointment?.preferred_date
      ? new Date(appointment.preferred_date)
      : null;

    if (!preferredDate || Number.isNaN(preferredDate.getTime())) {
      return Number.MAX_SAFE_INTEGER;
    }

    const time = String(appointment?.preferred_time || '').trim();
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hour, minute] = time.split(':').map(Number);
      preferredDate.setHours(hour, minute, 0, 0);
    } else {
      preferredDate.setHours(0, 0, 0, 0);
    }

    return preferredDate.getTime();
  }

  /**
   * Get complete dashboard data for customer
   */
  async getDashboardData(customerId, req) {
    try {
      const customer = await Customer.findById(customerId)
        .select('fullName')
        .lean();

      const firstName = this._extractFirstName(customer?.fullName);

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
        welcomeMessage: `Welcome back, ${firstName}!`,
        stats,
        recentOrders,
        upcomingAppointments,
        medicineRecommendations,
        quickActions: this.getQuickActions(),
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

    const upcomingAppointmentsCount =
      await this.getUpcomingAppointmentsCount(customerId);

    return {
      totalOrders,
      upcomingAppointments: upcomingAppointmentsCount,
    };
  }

  async getUpcomingAppointmentsCount(customerId) {
    const appointments = await Appointment.find(
      this._getUpcomingAppointmentBaseQuery(customerId)
    )
      .select('slot_id preferred_date status appointment_request')
      .populate('slot_id', 'date')
      .lean();

    return appointments.filter(appointment =>
      this._isUpcomingAppointment(appointment)
    ).length;
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

    const deliveries = await Delivery.find({
      order_id: { $in: orders.map(order => order._id) },
    })
      .select('order_id calculated_fare')
      .lean();

    const deliveryFareByOrderId = new Map(
      deliveries.map(delivery => [
        String(delivery.order_id),
        Number(delivery.calculated_fare || 0),
      ])
    );

    return orders.map(order => ({
      _id: order._id,
      total: order.total,
      status: order.status,
      created_at: order.created_at,
      delivery_charges: deliveryFareByOrderId.get(String(order._id)) || 0,
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
    const appointments = await Appointment.find(
      this._getUpcomingAppointmentBaseQuery(customerId)
    )
      .limit(20)
      .populate('doctor_id', 'fullName specialization profile_img_url')
      .populate('slot_id', 'date start_time end_time')
      .lean();

    const sortedAppointments = appointments
      .filter(appointment => this._isUpcomingAppointment(appointment))
      .slice()
      .sort(
        (a, b) =>
          this._getAppointmentSortTime(a) - this._getAppointmentSortTime(b)
      )
      .slice(0, 3);

    return sortedAppointments.map(apt => ({
      _id: apt._id,
      doctor: apt.doctor_id,
      slot: apt.slot_id,
      status: apt.status,
      appointment_request: apt.appointment_request,
      appointment_type: apt.appointment_type,
      preferred_date: apt.preferred_date || null,
      preferred_time: apt.preferred_time || null,
      created_at: apt.created_at,
    }));
  }

  getQuickActions() {
    return [
      {
        key: 'order_medicine',
        label: 'Order Medicine',
        route: '/customer/medicines',
        method: 'GET',
      },
      {
        key: 'book_appointment',
        label: 'Book Appointment',
        route: '/customer/appointments/requests',
        method: 'POST',
      },
      {
        key: 'my_appointments',
        label: 'My Appointments',
        route: '/customer/appointments',
        method: 'GET',
      },
      {
        key: 'my_orders',
        label: 'My Orders',
        route: '/customer/order-management/orders',
        method: 'GET',
      },
      {
        key: 'my_profile',
        label: 'My Profile',
        route: '/customer/profile',
        method: 'GET',
      },
      {
        key: 'search_history',
        label: 'Search History',
        route: '/customer/search-history',
        method: 'GET',
      },
    ];
  }

  /**
   * Get medicine recommendations based on frequently ordered medicines
   */
  async getMedicineRecommendations(customerId) {
    const { seedMedicineIds } =
      await this._getRecommendationSeedMedicines(customerId);

    const recommendations = [];
    const seenKeys = new Set();

    const pushMedicine = medicine => {
      if (!medicine) return;
      const key = this._buildMedicineIdentityKey(medicine);
      if (!key || seenKeys.has(key)) return;
      seenKeys.add(key);
      recommendations.push(this._sanitizeRecommendationMedicine(medicine));
    };

    for (const seedMedicineId of seedMedicineIds) {
      const seedMedicine = await Medicine.findById(seedMedicineId)
        .select(
          'Name alias_name img_urls sale_price description mgs dosage_form category manufacturer prescription_required active'
        )
        .lean();

      if (!seedMedicine) continue;

      pushMedicine(seedMedicine);

      const relatedResult = await MedicineCatalogService.getRelatedMedicines(
        seedMedicineId,
        customerId,
        { limit: 6 }
      );

      for (const related of relatedResult?.data?.medicines || []) {
        pushMedicine(related);
      }

      if (recommendations.length >= 8) {
        break;
      }
    }

    if (recommendations.length < 5) {
      const fallback = await this._getFallbackMedicines(5, seenKeys);
      recommendations.push(...fallback);
    }

    return recommendations.slice(0, 8);
  }
}

export default new CustomerDashboardService();
