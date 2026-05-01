import Customer from '../../../../../models/Customer.js';
import Order from '../../../../../models/Order.js';
import Appointment from '../../../../../models/Appointment.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Review from '../../../../../models/Review.js';
import exportService from '../../../../../utils/exportService.js';
import { logAdminActivity } from '../../../utils/logAdminActivities.js';
import mongoose from 'mongoose';

class ExportDataService {
  /**
   * Export customers data
   * @param {Object} filters - Query filters (branch_id, status)
   * @param {string} format - Export format (xlsx or csv)
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} Export result with filename, url, and record count
   */
  async exportCustomers(filters = {}, format = 'xlsx', req = null) {
    try {
      // Build query
      const query = {};
      if (filters.branch_id) {
        query.branch_id = filters.branch_id;
      }
      if (filters.status) {
        query.status = filters.status;
      }

      // Fetch customers
      const customers = await Customer.find(query)
        .select('fullName email phone_number address status created_at')
        .lean();

      if (customers.length === 0) {
        throw new Error('NO_DATA_TO_EXPORT');
      }

      // Format data
      const data = customers.map(c => ({
        'Full Name': c.fullName || 'N/A',
        Email: c.email || 'N/A',
        Phone: c.phone_number || 'N/A',
        Address: c.address || 'N/A',
        Status: c.status || 'active',
        'Created Date': new Date(c.created_at).toLocaleDateString(),
      }));

      // Generate file
      const filename = `customers_${Date.now()}`;
      if (format === 'csv') {
        await exportService.exportToCSV(data, filename);
      } else {
        await exportService.exportToExcel(data, filename, 'Customers');
      }

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'EXPORT_CUSTOMERS',
          `Exported ${customers.length} customers to ${format}`,
          'customers',
          null,
          { count: customers.length, format }
        );
      }

      const fileUrl = exportService.getDownloadUrl(`${filename}.${format}`);
      return {
        success: true,
        file_name: `${filename}.${format}`,
        file_url: fileUrl,
        record_count: customers.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export orders data
   * @param {Object} filters - Query filters (branch_id, status, date_from, date_to)
   * @param {string} format - Export format (xlsx or csv)
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} Export result with filename, url, and record count
   */
  async exportOrders(filters = {}, format = 'xlsx', req = null) {
    try {
      // Build query
      const query = {};
      if (filters.branch_id) {
        query.branch_id = filters.branch_id;
      }
      if (filters.status) {
        query.order_status = filters.status;
      }
      if (filters.date_from || filters.date_to) {
        query.created_at = {};
        if (filters.date_from)
          query.created_at.$gte = new Date(filters.date_from);
        if (filters.date_to) query.created_at.$lte = new Date(filters.date_to);
      }

      // Fetch orders
      const orders = await Order.find(query)
        .populate('customer_id', 'fullName email')
        .populate('branch_id', 'name')
        .select(
          '_id order_status total_amount delivery_charges customer_id branch_id created_at'
        )
        .lean();

      if (orders.length === 0) {
        throw new Error('NO_DATA_TO_EXPORT');
      }

      // Format data
      const data = orders.map(o => ({
        'Order ID': o._id.toString().slice(-8),
        Customer: o.customer_id?.fullName || 'Unknown',
        Email: o.customer_id?.email || 'N/A',
        Branch: o.branch_id?.name || 'Unknown',
        Status: o.order_status || 'pending',
        'Total Amount': o.total_amount || 0,
        'Delivery Charges': o.delivery_charges || 0,
        'Order Date': new Date(o.created_at).toLocaleDateString(),
      }));

      // Generate file
      const filename = `orders_${Date.now()}`;
      if (format === 'csv') {
        await exportService.exportToCSV(data, filename);
      } else {
        await exportService.exportToExcel(data, filename, 'Orders');
      }

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'EXPORT_ORDERS',
          `Exported ${orders.length} orders to ${format}`,
          'orders',
          null,
          { count: orders.length, format }
        );
      }

      const fileUrl = exportService.getDownloadUrl(`${filename}.${format}`);
      return {
        success: true,
        file_name: `${filename}.${format}`,
        file_url: fileUrl,
        record_count: orders.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export appointments data
   * @param {Object} filters - Query filters (status, date_from, date_to, doctor_id)
   * @param {string} format - Export format (xlsx or csv)
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} Export result with filename, url, and record count
   */
  async exportAppointments(filters = {}, format = 'xlsx', req = null) {
    try {
      // Build query
      const query = {};
      if (filters.status) {
        query.appointment_status = filters.status;
      }
      if (filters.doctor_id) {
        query.doctor_id = new mongoose.Types.ObjectId(filters.doctor_id);
      }
      if (filters.date_from || filters.date_to) {
        query.created_at = {};
        if (filters.date_from)
          query.created_at.$gte = new Date(filters.date_from);
        if (filters.date_to) query.created_at.$lte = new Date(filters.date_to);
      }

      // Fetch appointments
      const appointments = await Appointment.find(query)
        .populate('doctor_id', 'fullName specialization')
        .populate('patient_id', 'first_name last_name email')
        .select(
          '_id appointment_status doctor_id patient_id appointment_date appointment_time created_at'
        )
        .lean();

      if (appointments.length === 0) {
        throw new Error('NO_DATA_TO_EXPORT');
      }

      // Format data
      const data = appointments.map(a => ({
        'Appointment ID': a._id.toString().slice(-8),
        Doctor: a.doctor_id?.fullName || 'Unknown',
        Specialization: a.doctor_id?.specialization || 'N/A',
        Patient:
          a.patient_id?.first_name + ' ' + a.patient_id?.last_name || 'Unknown',
        Email: a.patient_id?.email || 'N/A',
        Date: new Date(a.appointment_date).toLocaleDateString(),
        Time: a.appointment_time || 'N/A',
        Status: a.appointment_status || 'pending',
      }));

      // Generate file
      const filename = `appointments_${Date.now()}`;
      if (format === 'csv') {
        await exportService.exportToCSV(data, filename);
      } else {
        await exportService.exportToExcel(data, filename, 'Appointments');
      }

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'EXPORT_APPOINTMENTS',
          `Exported ${appointments.length} appointments to ${format}`,
          'appointments',
          null,
          { count: appointments.length, format }
        );
      }

      const fileUrl = exportService.getDownloadUrl(`${filename}.${format}`);
      return {
        success: true,
        file_name: `${filename}.${format}`,
        file_url: fileUrl,
        record_count: appointments.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export inventory data
   * @param {Object} filters - Query filters (branch_id)
   * @param {string} format - Export format (xlsx or csv)
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} Export result with filename, url, and record count
   */
  async exportInventory(filters = {}, format = 'xlsx', req = null) {
    try {
      // Build query
      const query = {};
      if (filters.branch_id) {
        query.branch_id = filters.branch_id;
      }

      // Fetch inventory
      const stocks = await StockInHand.find(query)
        .populate('medicine_id', 'Name generic_name strength sale_price')
        .populate('branch_id', 'name')
        .select('quantity reorder_point medicine_id branch_id')
        .lean();

      if (stocks.length === 0) {
        throw new Error('NO_DATA_TO_EXPORT');
      }

      // Format data
      const data = stocks.map(s => ({
        'Medicine Name': s.medicine_id?.Name || 'Unknown',
        'Generic Name': s.medicine_id?.generic_name || 'N/A',
        Strength: s.medicine_id?.strength || 'N/A',
        Branch: s.branch_id?.name || 'Unknown',
        Quantity: s.quantity || 0,
        'Reorder Point': s.reorder_point || 0,
        'Unit Price': s.medicine_id?.sale_price || 0,
        'Total Value': (s.quantity || 0) * (s.medicine_id?.sale_price || 0),
      }));

      // Generate file
      const filename = `inventory_${Date.now()}`;
      if (format === 'csv') {
        await exportService.exportToCSV(data, filename);
      } else {
        await exportService.exportToExcel(data, filename, 'Inventory');
      }

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'EXPORT_INVENTORY',
          `Exported ${stocks.length} inventory items to ${format}`,
          'inventory',
          null,
          { count: stocks.length, format }
        );
      }

      const fileUrl = exportService.getDownloadUrl(`${filename}.${format}`);
      return {
        success: true,
        file_name: `${filename}.${format}`,
        file_url: fileUrl,
        record_count: stocks.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export reviews data
   * @param {Object} filters - Query filters (rating, date_from, date_to)
   * @param {string} format - Export format (xlsx or csv)
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} Export result with filename, url, and record count
   */
  async exportReviews(filters = {}, format = 'xlsx', req = null) {
    try {
      // Build query
      const query = {};
      if (filters.rating) {
        query.rating = parseInt(filters.rating);
      }
      if (filters.date_from || filters.date_to) {
        query.created_at = {};
        if (filters.date_from)
          query.created_at.$gte = new Date(filters.date_from);
        if (filters.date_to) query.created_at.$lte = new Date(filters.date_to);
      }

      // Fetch reviews
      const reviews = await Review.find(query)
        .populate('reviewer_id', 'fullName')
        .populate('doctor_id', 'fullName specialization')
        .select('_id rating comment reviewer_id doctor_id created_at')
        .lean();

      if (reviews.length === 0) {
        throw new Error('NO_DATA_TO_EXPORT');
      }

      // Format data
      const data = reviews.map(r => ({
        'Review ID': r._id.toString().slice(-8),
        Doctor: r.doctor_id?.fullName || 'Unknown',
        Reviewer: r.reviewer_id?.fullName || 'Anonymous',
        Rating: r.rating || 0,
        Comment: r.comment || 'N/A',
        Date: new Date(r.created_at).toLocaleDateString(),
      }));

      // Generate file
      const filename = `reviews_${Date.now()}`;
      if (format === 'csv') {
        await exportService.exportToCSV(data, filename);
      } else {
        await exportService.exportToExcel(data, filename, 'Reviews');
      }

      // Log activity
      if (req) {
        await logAdminActivity(
          req,
          'EXPORT_REVIEWS',
          `Exported ${reviews.length} reviews to ${format}`,
          'reviews',
          null,
          { count: reviews.length, format }
        );
      }

      const fileUrl = exportService.getDownloadUrl(`${filename}.${format}`);
      return {
        success: true,
        file_name: `${filename}.${format}`,
        file_url: fileUrl,
        record_count: reviews.length,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ExportDataService();
