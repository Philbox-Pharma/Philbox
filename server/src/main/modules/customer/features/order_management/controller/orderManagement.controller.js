import PDFDocument from 'pdfkit';
import orderManagementService from '../service/orderManagement.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class CustomerOrderManagementController {
  async getOrders(req, res) {
    try {
      const customerId = req.user?.id || req.user?._id;
      if (!customerId) {
        return sendResponse(
          res,
          401,
          'UNAUTHORIZED',
          null,
          'Customer ID not found'
        );
      }

      const result = await orderManagementService.getOrders(
        customerId,
        req.query
      );

      await logCustomerActivity(
        req,
        'VIEWED_ORDERS',
        'Viewed customer orders',
        'orders'
      );

      return sendResponse(res, 200, 'ORDERS_FETCHED', result);
    } catch (error) {
      return sendResponse(res, 500, 'SERVER_ERROR', null, error.message);
    }
  }

  async reorderOrder(req, res) {
    try {
      const customerId = req.user?.id || req.user?._id;
      if (!customerId) {
        return sendResponse(
          res,
          401,
          'UNAUTHORIZED',
          null,
          'Customer ID not found'
        );
      }

      const { orderId } = req.params;
      const result = await orderManagementService.reorderOrder(
        customerId,
        orderId
      );

      await logCustomerActivity(
        req,
        'REORDERED_ORDER',
        'Reordered previous purchase',
        'orders',
        orderId
      );

      return sendResponse(res, 200, 'ORDER_REORDERED', result);
    } catch (error) {
      const errorMap = {
        ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND' },
        ORDER_ITEMS_NOT_AVAILABLE: {
          status: 400,
          code: 'ORDER_ITEMS_NOT_AVAILABLE',
        },
      };

      const errorInfo = errorMap[error.message] || {
        status: 500,
        code: 'SERVER_ERROR',
      };

      return sendResponse(
        res,
        errorInfo.status,
        errorInfo.code,
        null,
        error.message
      );
    }
  }

  async createOrderReview(req, res) {
    try {
      const customerId = req.user?.id || req.user?._id;
      if (!customerId) {
        return sendResponse(
          res,
          401,
          'UNAUTHORIZED',
          null,
          'Customer ID not found'
        );
      }

      const { orderId } = req.params;
      const { rating, message } = req.body;

      const review = await orderManagementService.createOrderReview(
        customerId,
        orderId,
        {
          rating,
          message,
        }
      );

      await logCustomerActivity(
        req,
        'CREATED_ORDER_REVIEW',
        'Created review for completed order',
        'reviews',
        review._id
      );

      return sendResponse(res, 201, 'ORDER_REVIEW_CREATED', review);
    } catch (error) {
      const errorMap = {
        ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND' },
        ORDER_NOT_COMPLETED: { status: 400, code: 'ORDER_NOT_COMPLETED' },
        REVIEW_ALREADY_EXISTS: { status: 409, code: 'REVIEW_ALREADY_EXISTS' },
        INVALID_RATING: { status: 400, code: 'INVALID_RATING' },
        REVIEW_MESSAGE_REQUIRED: {
          status: 400,
          code: 'REVIEW_MESSAGE_REQUIRED',
        },
      };

      const errorInfo = errorMap[error.message] || {
        status: 500,
        code: 'SERVER_ERROR',
      };

      return sendResponse(
        res,
        errorInfo.status,
        errorInfo.code,
        null,
        error.message
      );
    }
  }

  async getOrderDetails(req, res) {
    try {
      const customerId = req.user?.id || req.user?._id;
      if (!customerId) {
        return sendResponse(
          res,
          401,
          'UNAUTHORIZED',
          null,
          'Customer ID not found'
        );
      }

      const { orderId } = req.params;
      const order = await orderManagementService.getOrderDetails(
        customerId,
        orderId
      );

      await logCustomerActivity(
        req,
        'VIEWED_ORDER_DETAILS',
        'Viewed customer order details',
        'orders',
        order._id
      );

      return sendResponse(res, 200, 'ORDER_DETAILS_FETCHED', order);
    } catch (error) {
      const errorMap = {
        ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND' },
      };

      const errorInfo = errorMap[error.message] || {
        status: 500,
        code: 'SERVER_ERROR',
      };

      return sendResponse(
        res,
        errorInfo.status,
        errorInfo.code,
        null,
        error.message
      );
    }
  }

  async cancelOrder(req, res) {
    try {
      const customerId = req.user?.id || req.user?._id;
      if (!customerId) {
        return sendResponse(
          res,
          401,
          'UNAUTHORIZED',
          null,
          'Customer ID not found'
        );
      }

      const { orderId } = req.params;
      const { cancellation_reason } = req.body;

      const result = await orderManagementService.cancelOrder(
        customerId,
        orderId,
        cancellation_reason
      );

      await logCustomerActivity(
        req,
        'REQUESTED_ORDER_CANCELLATION',
        'Requested customer order cancellation',
        'orders',
        orderId,
        {
          cancellation_request_status: result.cancellation_request_status,
        }
      );

      return sendResponse(res, 200, 'ORDER_CANCELLATION_REQUESTED', result);
    } catch (error) {
      const errorMap = {
        ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND' },
        ORDER_ALREADY_COMPLETED: {
          status: 400,
          code: 'ORDER_ALREADY_COMPLETED',
        },
        ORDER_ALREADY_CANCELLED: {
          status: 400,
          code: 'ORDER_ALREADY_CANCELLED',
        },
        ORDER_CANCELLATION_ALREADY_REQUESTED: {
          status: 400,
          code: 'ORDER_CANCELLATION_ALREADY_REQUESTED',
        },
        ORDER_CANCELLATION_ALREADY_PROCESSED: {
          status: 400,
          code: 'ORDER_CANCELLATION_ALREADY_PROCESSED',
        },
        BRANCH_SALESPERSON_NOT_FOUND: {
          status: 500,
          code: 'BRANCH_SALESPERSON_NOT_FOUND',
        },
      };

      const errorInfo = errorMap[error.message] || {
        status: 500,
        code: 'SERVER_ERROR',
      };

      return sendResponse(
        res,
        errorInfo.status,
        errorInfo.code,
        null,
        error.message
      );
    }
  }

  async downloadInvoice(req, res) {
    try {
      const customerId = req.user?.id || req.user?._id;
      if (!customerId) {
        return sendResponse(
          res,
          401,
          'UNAUTHORIZED',
          null,
          'Customer ID not found'
        );
      }

      const { orderId } = req.params;
      const { order, transaction } =
        await orderManagementService.getInvoiceData(customerId, orderId);

      const customerName =
        order.customer_id?.fullName ||
        order.customer_id?.name ||
        'Valued Customer';
      const branchName =
        order.branch_id?.branch_name || order.branch_id?.name || 'Philbox';
      const invoiceNumber = `INV-${String(order._id).slice(-8).toUpperCase()}`;
      const currencyCode = transaction?.currency?.code || 'PKR';
      const currencySymbol = transaction?.currency?.symbol || 'PKR';
      const invoiceDate = new Date(
        order.created_at || Date.now()
      ).toLocaleDateString('en-PK');
      const itemRows = Array.isArray(order.order_items)
        ? order.order_items
        : [];

      await logCustomerActivity(
        req,
        'DOWNLOADED_INVOICE',
        'Downloaded order invoice',
        'orders',
        order._id,
        {
          payment_status: transaction?.payment_status || null,
          total: order.total_after_applying_coupon ?? order.total ?? null,
        }
      );

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const fileName = `philbox-invoice-${String(order._id)}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );

      doc.pipe(res);

      doc.fontSize(22).text('Philbox Invoice', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
      doc.text(`Invoice Date: ${invoiceDate}`);
      doc.text(`Order ID: ${String(order._id)}`);
      doc.text(`Customer: ${customerName}`);
      doc.text(`Branch: ${branchName}`);
      doc.text(`Status: ${order.status}`);
      doc.moveDown();

      doc.fontSize(14).text('Items', { underline: true });
      doc.moveDown(0.5);

      itemRows.forEach(item => {
        const lineTotal = Number(item.subtotal || 0).toFixed(2);
        doc
          .fontSize(11)
          .text(
            `${item.medicine_name} x ${item.quantity}  |  ${currencySymbol} ${lineTotal}`
          );
      });

      doc.moveDown();
      doc
        .fontSize(12)
        .text(
          `Subtotal: ${currencySymbol} ${Number(order.subtotal || order.total || 0).toFixed(2)}`
        );
      doc.text(
        `Total After Coupon: ${currencySymbol} ${Number(order.total_after_applying_coupon ?? order.total ?? 0).toFixed(2)}`
      );
      doc.text(
        `Payment Method: ${transaction?.payment_method || 'N/A'}${transaction?.payment_status ? ` (${transaction.payment_status})` : ''}`
      );
      doc.text(`Currency: ${currencyCode}`);

      doc.moveDown();
      doc
        .fontSize(10)
        .fillColor('gray')
        .text('Thank you for shopping with Philbox.', {
          align: 'center',
        });

      doc.end();
    } catch (error) {
      const errorMap = {
        ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND' },
      };

      const errorInfo = errorMap[error.message] || {
        status: 500,
        code: 'SERVER_ERROR',
      };

      return sendResponse(
        res,
        errorInfo.status,
        errorInfo.code,
        null,
        error.message
      );
    }
  }
}

export default new CustomerOrderManagementController();
