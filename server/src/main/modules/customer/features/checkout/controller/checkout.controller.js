import checkoutService from '../service/checkout.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';
import PDFDocument from 'pdfkit';

class CheckoutController {
  async getCheckoutSummary(req, res) {
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

      const { address_id, coupon_code, delivery_google_map_link } = req.query;
      const summary = await checkoutService.getCheckoutSummary(customerId, {
        address_id,
        coupon_code,
        delivery_google_map_link,
      });

      await logCustomerActivity(
        req,
        'VIEWED_CHECKOUT_SUMMARY',
        'Viewed checkout summary',
        'checkout'
      );

      return sendResponse(res, 200, 'CHECKOUT_SUMMARY_FETCHED', summary);
    } catch (error) {
      const errorMap = {
        CART_EMPTY: { status: 400, code: 'CART_EMPTY' },
        CUSTOMER_NOT_FOUND: { status: 404, code: 'CUSTOMER_NOT_FOUND' },
        CUSTOMER_ADDRESS_NOT_FOUND: { status: 404, code: 'ADDRESS_NOT_FOUND' },
        INVALID_ADDRESS_ID: { status: 400, code: 'INVALID_ADDRESS_ID' },
        INVALID_COUPON: { status: 400, code: 'INVALID_COUPON' },
        COUPON_INACTIVE: { status: 400, code: 'COUPON_INACTIVE' },
        COUPON_EXPIRED: { status: 400, code: 'COUPON_EXPIRED' },
        COUPON_TYPE_MISMATCH: { status: 400, code: 'COUPON_TYPE_MISMATCH' },
        COUPON_USAGE_LIMIT_REACHED: { status: 400, code: 'COUPON_LIMIT' },
        DELIVERY_FARE_NOT_CONFIGURED: {
          status: 500,
          code: 'DELIVERY_FARE_CONFIG_ERROR',
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

  async uploadPrescription(req, res) {
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

      if (!req.file) {
        return sendResponse(
          res,
          400,
          'FILE_REQUIRED',
          null,
          'Prescription file is required'
        );
      }

      const { notes } = req.body;
      const prescription = await checkoutService.uploadPrescription(
        customerId,
        req.file,
        notes
      );

      return sendResponse(res, 201, 'PRESCRIPTION_UPLOADED', prescription);
    } catch (error) {
      const errorMap = {
        PRESCRIPTION_FILE_REQUIRED: { status: 400, code: 'FILE_REQUIRED' },
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

  async createStripeTestPaymentMethod(req, res) {
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

      const result = await checkoutService.createStripeTestPaymentMethod({
        cardNumber: req.body.card_number,
        expMonth: req.body.exp_month,
        expYear: req.body.exp_year,
        cvc: req.body.cvc,
        name: req.body.cardholder_name,
      });

      return sendResponse(res, 200, 'STRIPE_TEST_PAYMENT_METHOD_READY', result);
    } catch (error) {
      const errorMap = {
        STRIPE_NOT_CONFIGURED: { status: 500, code: 'STRIPE_CONFIG_ERROR' },
        STRIPE_PAYMENT_METHOD_FIELDS_REQUIRED: {
          status: 400,
          code: 'STRIPE_FIELDS_REQUIRED',
        },
        STRIPE_PAYMENT_METHOD_NOT_READY: {
          status: 400,
          code: 'STRIPE_METHOD_NOT_READY',
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
      const { order, transaction } = await checkoutService.getInvoiceData(
        customerId,
        orderId
      );

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

      order.order_items.forEach(item => {
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
          `Subtotal: ${currencySymbol} ${Number(order.total || 0).toFixed(2)}`
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

  async placeOrder(req, res) {
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

      const payload = {
        address_id: req.body.address_id,
        delivery_google_map_link: req.body.delivery_google_map_link,
        coupon_code: req.body.coupon_code,
        payment_method: req.body.payment_method,
        wallet_number: req.body.wallet_number,
        stripe_payment_method_id: req.body.stripe_payment_method_id,
        prescription_id: req.body.prescription_id,
        notes: req.body.notes,
        ipAddress: req.ip,
        device_details: req.get('user-agent') || 'unknown',
        country: req.body.country || 'PK',
      };

      const result = await checkoutService.placeOrder(customerId, payload);

      await logCustomerActivity(
        req,
        'PLACED_ORDER',
        'Placed checkout order',
        'orders',
        result?.orders?.[0]?._id || null,
        {
          total: result?.summary?.total ?? null,
          delivery_charges: result?.summary?.delivery_charges ?? null,
          payment_method: req.body.payment_method || null,
          coupon_code: req.body.coupon_code || null,
        }
      );

      return sendResponse(res, 201, 'ORDER_PLACED', result);
    } catch (error) {
      const errorMap = {
        CART_EMPTY: { status: 400, code: 'CART_EMPTY' },
        CUSTOMER_NOT_FOUND: { status: 404, code: 'CUSTOMER_NOT_FOUND' },
        CUSTOMER_ADDRESS_NOT_FOUND: { status: 404, code: 'ADDRESS_NOT_FOUND' },
        INVALID_ADDRESS_ID: { status: 400, code: 'INVALID_ADDRESS_ID' },
        DELIVERY_GOOGLE_MAP_LINK_REQUIRED: {
          status: 400,
          code: 'MAP_LINK_REQUIRED',
        },
        NO_VALID_CART_ITEMS_FOR_CHECKOUT: {
          status: 400,
          code: 'NO_VALID_CART_ITEMS_FOR_CHECKOUT',
        },
        PRESCRIPTION_REQUIRED: { status: 400, code: 'PRESCRIPTION_REQUIRED' },
        PRESCRIPTION_NOT_FOUND: { status: 404, code: 'PRESCRIPTION_NOT_FOUND' },
        CURRENCY_NOT_CONFIGURED: { status: 500, code: 'CURRENCY_CONFIG_ERROR' },
        INVALID_PAYMENT_METHOD: { status: 400, code: 'INVALID_PAYMENT_METHOD' },
        STRIPE_NOT_CONFIGURED: { status: 500, code: 'STRIPE_CONFIG_ERROR' },
        STRIPE_PAYMENT_METHOD_REQUIRED: {
          status: 400,
          code: 'STRIPE_METHOD_REQUIRED',
        },
        STRIPE_PAYMENT_NOT_COMPLETED: {
          status: 400,
          code: 'STRIPE_PAYMENT_FAILED',
        },
        JAZZCASH_NOT_CONFIGURED: { status: 500, code: 'JAZZCASH_CONFIG_ERROR' },
        WALLET_NUMBER_REQUIRED: { status: 400, code: 'WALLET_NUMBER_REQUIRED' },
        JAZZCASH_PAYMENT_FAILED: {
          status: 400,
          code: 'JAZZCASH_PAYMENT_FAILED',
        },
        EASYPAISA_NOT_CONFIGURED: {
          status: 500,
          code: 'EASYPAISA_CONFIG_ERROR',
        },
        EASYPAISA_PAYMENT_FAILED: {
          status: 400,
          code: 'EASYPAISA_PAYMENT_FAILED',
        },
        INSUFFICIENT_STOCK_FOR_CHECKOUT: {
          status: 400,
          code: 'INSUFFICIENT_STOCK',
        },
        INVALID_COUPON: { status: 400, code: 'INVALID_COUPON' },
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

export default new CheckoutController();
