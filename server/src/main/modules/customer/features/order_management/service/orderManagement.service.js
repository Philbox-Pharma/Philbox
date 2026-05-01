import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import Stripe from 'stripe';
import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import Delivery from '../../../../../models/Delivery.js';
import Transaction from '../../../../../models/Transaction.js';
import Review from '../../../../../models/Review.js';
import Branch from '../../../../../models/Branch.js';
import Medicine from '../../../../../models/Medicine.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Currency from '../../../../../models/Currency.js';
import cartService from '../../cart/service/cart.service.js';
import checkoutService from '../../checkout/service/checkout.service.js';
import {
  emitToBranch,
  emitToSalesperson,
} from '../../../../../config/socket.config.js';
import {
  sendEmail,
  sendRefundCompletionNotificationToCustomer,
} from '../../../../../utils/sendEmail.js';
import notificationService from '../../../../../utils/notificationService.js';

const to2 = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const SENTIMENT_API_URL =
  process.env.SENTIMENT_API_URL ||
  process.env.SENTIMENT_ANALYSIS_API_URL ||
  'https://sentiment-api.vercel.app/predict';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const safeString = value => String(value ?? '').trim();
const toSmallestUnit = amount =>
  Math.max(1, Math.round(Number(amount || 0) * 100));

const buildRequestSignature = ({ secret, parts }) => {
  const payload = parts.map(part => safeString(part)).join('|');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

const gatewayResponseIsSuccess = responseData => {
  const statusText = safeString(
    responseData?.status ||
      responseData?.payment_status ||
      responseData?.statusCode ||
      responseData?.responseCode ||
      responseData?.pp_ResponseCode ||
      responseData?.result
  ).toLowerCase();

  return (
    statusText === 'success' ||
    statusText === 'succeeded' ||
    statusText === '00' ||
    statusText === '000' ||
    statusText === 'approved' ||
    statusText === 'completed'
  );
};

class CustomerOrderManagementService {
  async _processStripeRefund({ paymentIntentId, refundAmount, orderId }) {
    if (!stripeClient) {
      throw new Error('STRIPE_NOT_CONFIGURED');
    }

    if (!safeString(paymentIntentId)) {
      throw new Error('STRIPE_PAYMENT_INTENT_MISSING');
    }

    const refund = await stripeClient.refunds.create({
      payment_intent: paymentIntentId,
      amount: toSmallestUnit(refundAmount),
      reason: 'requested_by_customer',
      metadata: {
        order_id: String(orderId),
      },
    });

    if (refund.status !== 'succeeded' && refund.status !== 'pending') {
      throw new Error('STRIPE_REFUND_FAILED');
    }

    return {
      provider: 'stripe',
      refundTransactionId: refund.id,
      status: refund.status,
      raw: refund,
    };
  }

  async _processJazzCashRefund({ paymentTransaction, refundAmount, orderId }) {
    const apiUrl =
      process.env.JAZZCASH_REFUND_API_URL || process.env.JAZZCASH_API_URL;
    const merchantId = process.env.JAZZCASH_MERCHANT_ID;
    const merchantPassword = process.env.JAZZCASH_MERCHANT_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!apiUrl || !merchantId || !merchantPassword || !integritySalt) {
      throw new Error('JAZZCASH_REFUND_NOT_CONFIGURED');
    }

    const originalTxn = safeString(paymentTransaction?.gateway_transaction_id);
    if (!originalTxn) {
      throw new Error('JAZZCASH_ORIGINAL_TXN_MISSING');
    }

    const amountPaisa = toSmallestUnit(refundAmount);
    const timestamp = Date.now().toString();
    const reference = `refund-${String(orderId)}`;
    const signature = buildRequestSignature({
      secret: integritySalt,
      parts: [
        merchantId,
        merchantPassword,
        originalTxn,
        amountPaisa,
        reference,
        timestamp,
      ],
    });

    const payload = {
      merchant_id: merchantId,
      merchant_password: merchantPassword,
      original_transaction_id: originalTxn,
      refund_amount: amountPaisa,
      currency: 'PKR',
      merchant_reference: reference,
      timestamp,
      signature,
    };

    const response = await axios.post(apiUrl, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!gatewayResponseIsSuccess(response.data)) {
      throw new Error('JAZZCASH_REFUND_FAILED');
    }

    return {
      provider: 'jazzcash',
      refundTransactionId:
        response.data?.gateway_transaction_id ||
        response.data?.transaction_id ||
        response.data?.pp_TxnRefNo ||
        reference,
      status: 'successful',
      raw: response.data,
    };
  }

  async _processEasyPaisaRefund({ paymentTransaction, refundAmount, orderId }) {
    const apiUrl =
      process.env.EASYPAISA_REFUND_API_URL || process.env.EASYPAISA_API_URL;
    const storeId = process.env.EASYPAISA_STORE_ID;
    const hashKey = process.env.EASYPAISA_HASH_KEY;

    if (!apiUrl || !storeId || !hashKey) {
      throw new Error('EASYPAISA_REFUND_NOT_CONFIGURED');
    }

    const originalTxn = safeString(paymentTransaction?.gateway_transaction_id);
    if (!originalTxn) {
      throw new Error('EASYPAISA_ORIGINAL_TXN_MISSING');
    }

    const amountPaisa = toSmallestUnit(refundAmount);
    const timestamp = Date.now().toString();
    const reference = `refund-${String(orderId)}`;
    const signature = buildRequestSignature({
      secret: hashKey,
      parts: [storeId, originalTxn, amountPaisa, reference, timestamp],
    });

    const payload = {
      store_id: storeId,
      original_transaction_id: originalTxn,
      refund_amount: amountPaisa,
      currency: 'PKR',
      merchant_reference: reference,
      timestamp,
      signature,
    };

    const response = await axios.post(apiUrl, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!gatewayResponseIsSuccess(response.data)) {
      throw new Error('EASYPAISA_REFUND_FAILED');
    }

    return {
      provider: 'easypaisa',
      refundTransactionId:
        response.data?.gateway_transaction_id ||
        response.data?.transaction_id ||
        response.data?.transactionRef ||
        reference,
      status: 'successful',
      raw: response.data,
    };
  }

  async _processGatewayRefund({ paymentTransaction, refundAmount, orderId }) {
    if (!paymentTransaction) {
      throw new Error('PAYMENT_TRANSACTION_NOT_FOUND');
    }

    const paymentMethod = paymentTransaction?.payment_method;

    if (paymentMethod === 'Stripe-Card') {
      return this._processStripeRefund({
        paymentIntentId: paymentTransaction?.stripe_payment_intent_id,
        refundAmount,
        orderId,
      });
    }

    if (paymentMethod === 'JazzCash-Wallet') {
      return this._processJazzCashRefund({
        paymentTransaction,
        refundAmount,
        orderId,
      });
    }

    if (paymentMethod === 'EasyPaisa-Wallet') {
      return this._processEasyPaisaRefund({
        paymentTransaction,
        refundAmount,
        orderId,
      });
    }

    throw new Error('UNSUPPORTED_PAYMENT_METHOD_FOR_REFUND');
  }

  _buildQuery(customerId, filters = {}) {
    const query = { customer_id: customerId };

    if (filters.search) {
      const searchValue = String(filters.search).trim();
      if (mongoose.Types.ObjectId.isValid(searchValue)) {
        query._id = new mongoose.Types.ObjectId(searchValue);
      }
    }

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.created_at = {};
      if (filters.dateFrom) {
        query.created_at.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.created_at.$lte = new Date(filters.dateTo);
      }
    }

    return query;
  }

  async getOrders(customerId, filters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10));
    const skip = (page - 1) * limit;

    const query = this._buildQuery(customerId, filters);

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .populate(
          'branch_id',
          'name branch_name code branch_code phone address_id'
        )
        .populate('coupon_id', 'cupon_code percent_off')
        .populate({
          path: 'order_items',
          populate: [
            {
              path: 'medicine_id',
              select:
                'Name img_url sale_price prescription_required category mgs dosage_form',
            },
            {
              path: 'branch_id',
              select: 'name branch_name code branch_code',
            },
          ],
        })
        .lean(),
      Order.countDocuments(query),
    ]);

    const orderIds = orders.map(order => order._id);

    const [deliveries, transactions] = await Promise.all([
      Delivery.find({ order_id: { $in: orderIds } })
        .select(
          'order_id calculated_fare google_address_link created_at updated_at'
        )
        .lean(),
      Transaction.find({ target_class: 'order', target_id: { $in: orderIds } })
        .populate('currency', 'code symbol')
        .sort({ transaction_at: -1 })
        .lean(),
    ]);

    const deliveryByOrderId = new Map(
      deliveries.map(delivery => [String(delivery.order_id), delivery])
    );

    const transactionByOrderId = new Map();
    for (const transaction of transactions) {
      const key = String(transaction.target_id);
      if (!transactionByOrderId.has(key)) {
        transactionByOrderId.set(key, transaction);
      }
    }

    return {
      orders: orders.map(order =>
        this._formatOrder(
          order,
          deliveryByOrderId.get(String(order._id)),
          transactionByOrderId.get(String(order._id))
        )
      ),
      pagination: {
        total_count: totalCount,
        page,
        limit,
        total_pages: Math.max(1, Math.ceil(totalCount / limit)),
      },
    };
  }

  async getOrderDetails(customerId, orderId) {
    const order = await Order.findOne({ _id: orderId, customer_id: customerId })
      .populate(
        'branch_id',
        'name branch_name code branch_code phone address_id'
      )
      .populate('coupon_id', 'cupon_code percent_off')
      .populate({
        path: 'order_items',
        populate: [
          {
            path: 'medicine_id',
            select:
              'Name img_url sale_price prescription_required category mgs dosage_form description',
          },
          {
            path: 'branch_id',
            select: 'name branch_name code branch_code phone',
          },
        ],
      })
      .lean();

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const [delivery, transaction] = await Promise.all([
      Delivery.findOne({ order_id: order._id })
        .select(
          'order_id calculated_fare google_address_link created_at updated_at'
        )
        .lean(),
      Transaction.findOne({
        target_class: 'order',
        target_id: order._id,
        transaction_type: 'pay',
      })
        .populate('currency', 'code symbol')
        .lean(),
    ]);

    const invoiceData = await checkoutService.getInvoiceData(
      customerId,
      orderId
    );

    return this._formatOrder(order, delivery, transaction, {
      invoice_url: order.invoice_url || null,
      invoice_data: invoiceData,
      detailed: true,
    });
  }

  async getInvoiceData(customerId, orderId) {
    return checkoutService.getInvoiceData(customerId, orderId);
  }

  async cancelOrder(customerId, orderId, cancellationReason = '') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findOne({
        _id: orderId,
        customer_id: customerId,
      }).session(session);

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      if (order.status === 'completed') {
        throw new Error('ORDER_ALREADY_COMPLETED');
      }

      if (
        order.status === 'cancelled-by-customer' ||
        order.refund_status === 'refunded'
      ) {
        throw new Error('ORDER_ALREADY_CANCELLED');
      }

      if (order.cancellation_request_status === 'requested') {
        throw new Error('ORDER_CANCELLATION_ALREADY_REQUESTED');
      }

      if (
        ['approved', 'rejected'].includes(order.cancellation_request_status)
      ) {
        throw new Error('ORDER_CANCELLATION_ALREADY_PROCESSED');
      }

      order.cancellation_request_status = 'requested';
      order.cancellation_requested_reason =
        cancellationReason || 'Cancellation requested by customer';
      order.cancellation_requested_at = new Date();
      order.cancellation_requested_by = customerId;
      order.cancellation_review_reason = '';
      order.cancellation_reviewed_by = null;
      order.cancellation_reviewed_at = null;
      order.cancellation_reason =
        cancellationReason || 'Cancellation requested by customer';

      await order.save({ session });

      const populatedOrder = await Order.findById(order._id)
        .populate('customer_id', 'fullName name email phone')
        .lean();

      const branch = await Branch.findById(order.branch_id)
        .select('salespersons_assigned name branch_name code branch_code')
        .lean();

      const branchSalespersonIds = order.salesperson_id
        ? [order.salesperson_id.toString()]
        : branch?.salespersons_assigned?.map(id => id.toString()) || [];

      await session.commitTransaction();

      const eventData = {
        order_id: order._id,
        order_reference: String(order._id),
        status: order.status,
        cancellation_request_status: order.cancellation_request_status,
        cancellation_reason: order.cancellation_reason,
        cancellation_requested_at: order.cancellation_requested_at,
      };

      emitToBranch(
        order.branch_id.toString(),
        'order:cancellation_requested',
        eventData
      );
      emitToBranch(
        order.branch_id.toString(),
        'order:status_updated',
        eventData
      );

      for (const salespersonId of branchSalespersonIds) {
        emitToSalesperson(
          salespersonId,
          'order:cancellation_requested',
          eventData
        );
        emitToSalesperson(salespersonId, 'order:status_updated', eventData);
      }

      if (populatedOrder?.customer_id?.email) {
        await sendEmail(
          populatedOrder.customer_id.email,
          `Philbox - Cancellation Request Received for Order #${String(order._id)}`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Cancellation Request Received</h2>
              <p>Dear ${populatedOrder.customer_id.fullName || populatedOrder.customer_id.name || 'Valued Customer'},</p>
              <p>We have received your cancellation request for order <strong>#${String(order._id)}</strong>.</p>
              <p>Our team will review it and update you soon.</p>
              <p>Thank you,<br/>Philbox Support</p>
            </div>
          `
        );
      }

      if (populatedOrder?.customer_id?.phone) {
        await notificationService.sendSMS(
          populatedOrder.customer_id.phone,
          `We received your cancellation request for order #${String(order._id)}. A salesperson will review it soon.`
        );
      }

      return {
        order_id: order._id,
        status: order.status,
        cancellation_request_status: order.cancellation_request_status,
        cancellation_reason: order.cancellation_reason,
        cancellation_requested_at: order.cancellation_requested_at,
        message:
          'Cancellation request submitted successfully. A salesperson will review it shortly.',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async approveCancellationRequest(
    orderId,
    salespersonId,
    branchId = null,
    reviewReason = ''
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      if (branchId && order.branch_id.toString() !== branchId) {
        throw new Error('ORDER_NOT_FROM_YOUR_BRANCH');
      }

      if (order.cancellation_request_status !== 'requested') {
        throw new Error('ORDER_CANCELLATION_NOT_REQUESTED');
      }

      if (order.status === 'completed') {
        throw new Error('ORDER_ALREADY_COMPLETED');
      }

      if (
        order.status === 'cancelled-by-customer' ||
        order.refund_status === 'refunded'
      ) {
        throw new Error('ORDER_ALREADY_CANCELLED');
      }

      const [orderItems, branch, paymentTransaction, fallbackCurrency] =
        await Promise.all([
          OrderItem.find({ order_id: order._id }).session(session),
          Branch.findById(order.branch_id)
            .select('salespersons_assigned name branch_name code branch_code')
            .lean(),
          Transaction.findOne({
            target_class: 'order',
            target_id: order._id,
            transaction_type: 'pay',
          })
            .sort({ createdAt: -1 })
            .session(session),
          Currency.findOne({ code: 'PKR' }).select('_id code symbol').lean(),
        ]);

      const medicineRefundTotals = new Map();
      for (const item of orderItems) {
        const medicineId = item.medicine_id?.toString?.() || null;
        if (!medicineId) continue;
        medicineRefundTotals.set(
          medicineId,
          (medicineRefundTotals.get(medicineId) || 0) +
            (Number(item.quantity) || 0)
        );
      }

      const refundAmount = to2(
        Number(order.total_after_applying_coupon ?? order.total ?? 0)
      );

      const gatewayRefundResult = await this._processGatewayRefund({
        paymentTransaction,
        refundAmount,
        orderId: order._id,
      });

      const branchSalespersonIds = order.salesperson_id
        ? [order.salesperson_id.toString()]
        : branch?.salespersons_assigned?.map(id => id.toString()) || [];
      const candidateSalespersonIds = branchSalespersonIds;

      let restoredItems = 0;
      for (const item of orderItems) {
        const quantityToRestore = Number(item.quantity) || 0;
        if (!quantityToRestore) continue;

        let stockRecord = null;

        for (const salespersonCandidate of candidateSalespersonIds) {
          stockRecord = await StockInHand.findOne({
            branch_id: order.branch_id,
            medicine_id: item.medicine_id,
            salesperson_id: salespersonCandidate,
          }).session(session);

          if (stockRecord) {
            break;
          }
        }

        if (stockRecord) {
          stockRecord.quantity =
            Number(stockRecord.quantity || 0) + quantityToRestore;
          await stockRecord.save({ session });
        } else {
          const stockSalespersonId =
            candidateSalespersonIds[0] ||
            order.salesperson_id?.toString?.() ||
            null;

          if (!stockSalespersonId) {
            throw new Error('BRANCH_SALESPERSON_NOT_FOUND');
          }

          await StockInHand.create(
            [
              {
                branch_id: order.branch_id,
                medicine_id: item.medicine_id,
                salesperson_id: stockSalespersonId,
                quantity: quantityToRestore,
                stockValue: 0,
                packQty: 0,
                alertResolved: false,
              },
            ],
            { session }
          );
        }

        restoredItems += 1;
      }

      const refundTransaction = await Transaction.create(
        [
          {
            target_class: 'order',
            target_id: order._id,
            total_bill: Number(
              order.total_after_applying_coupon ?? order.total ?? 0
            ),
            transaction_type: 'refund',
            currency: paymentTransaction?.currency || fallbackCurrency?._id,
            payment_status: 'successful',
            payment_method: paymentTransaction?.payment_method || 'Stripe-Card',
            refund_amount: refundAmount,
            refunded_item_ids: orderItems.map(item => item._id),
            stripe_payment_intent_id:
              paymentTransaction?.stripe_payment_intent_id || undefined,
            gateway_transaction_id:
              gatewayRefundResult?.refundTransactionId ||
              paymentTransaction?.gateway_transaction_id ||
              undefined,
            wallet_number: paymentTransaction?.wallet_number || undefined,
            device_details: 'customer-order-cancellation',
            country: paymentTransaction?.country || 'PK',
            ipAddress: paymentTransaction?.ipAddress || undefined,
          },
        ],
        { session }
      );

      order.status = 'cancelled-by-customer';
      order.refund_status = 'refunded';
      order.cancellation_request_status = 'approved';
      order.cancellation_review_reason =
        reviewReason || 'Cancellation request approved';
      order.cancellation_reviewed_by = salespersonId;
      order.cancellation_reviewed_at = new Date();
      order.cancelled_at = new Date();
      order.refund_transaction_id = refundTransaction[0]._id;
      await order.save({ session });

      for (const [
        medicineId,
        refundedQuantity,
      ] of medicineRefundTotals.entries()) {
        await Medicine.updateOne(
          { _id: medicineId },
          { $inc: { refunds_count: refundedQuantity } },
          { session }
        );
      }

      await session.commitTransaction();

      try {
        const populatedOrder = await Order.findById(order._id)
          .populate('customer_id', 'fullName name email phone')
          .lean();

        const eventData = {
          order_id: order._id,
          order_reference: String(order._id),
          status: order.status,
          refund_status: order.refund_status,
          refund_amount: refundAmount,
          cancellation_request_status: order.cancellation_request_status,
          cancellation_reason: order.cancellation_reason,
          cancellation_review_reason: order.cancellation_review_reason,
          cancelled_at: order.cancelled_at,
        };

        emitToBranch(order.branch_id.toString(), 'order:cancelled', eventData);
        emitToBranch(
          order.branch_id.toString(),
          'order:status_updated',
          eventData
        );

        for (const salespersonIdValue of branchSalespersonIds) {
          emitToSalesperson(salespersonIdValue, 'order:cancelled', eventData);
          emitToSalesperson(
            salespersonIdValue,
            'order:status_updated',
            eventData
          );
        }

        if (populatedOrder?.customer_id?.email) {
          await sendRefundCompletionNotificationToCustomer(
            populatedOrder.customer_id.email,
            populatedOrder.customer_id.fullName ||
              populatedOrder.customer_id.name ||
              'Valued Customer',
            String(order._id),
            refundAmount,
            paymentTransaction?.payment_method || 'original payment method'
          );
        }

        if (populatedOrder?.customer_id?.phone) {
          await notificationService.sendSMS(
            populatedOrder.customer_id.phone,
            `Your cancellation request for order #${String(order._id)} was approved and PKR ${refundAmount} has been refunded.`
          );
        }
      } catch (notificationError) {
        console.error(
          'Error sending order cancellation approval notifications:',
          notificationError
        );
      }

      return {
        order_id: order._id,
        status: order.status,
        refund_status: order.refund_status,
        cancellation_request_status: order.cancellation_request_status,
        cancellation_review_reason: order.cancellation_review_reason,
        refund_amount: refundAmount,
        refund_transaction: refundTransaction[0],
        restored_items: restoredItems,
        message:
          'Cancellation request approved successfully and refund processed.',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async rejectCancellationRequest(
    orderId,
    salespersonId,
    branchId = null,
    rejectionReason = ''
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error('ORDER_NOT_FOUND');
      }

      if (branchId && order.branch_id.toString() !== branchId) {
        throw new Error('ORDER_NOT_FROM_YOUR_BRANCH');
      }

      if (order.cancellation_request_status !== 'requested') {
        throw new Error('ORDER_CANCELLATION_NOT_REQUESTED');
      }

      order.cancellation_request_status = 'rejected';
      order.cancellation_review_reason =
        rejectionReason || 'Cancellation request rejected';
      order.cancellation_reviewed_by = salespersonId;
      order.cancellation_reviewed_at = new Date();
      await order.save({ session });

      await session.commitTransaction();

      try {
        const populatedOrder = await Order.findById(order._id)
          .populate('customer_id', 'fullName name email phone')
          .lean();

        const eventData = {
          order_id: order._id,
          order_reference: String(order._id),
          status: order.status,
          cancellation_request_status: order.cancellation_request_status,
          cancellation_review_reason: order.cancellation_review_reason,
          cancelled_at: order.cancelled_at,
        };

        emitToBranch(
          order.branch_id.toString(),
          'order:cancellation_rejected',
          eventData
        );
        emitToBranch(
          order.branch_id.toString(),
          'order:status_updated',
          eventData
        );

        const branch = await Branch.findById(order.branch_id)
          .select('salespersons_assigned')
          .lean();

        const branchSalespersonIds = order.salesperson_id
          ? [order.salesperson_id.toString()]
          : branch?.salespersons_assigned?.map(id => id.toString()) || [];

        for (const branchSalespersonId of branchSalespersonIds) {
          emitToSalesperson(
            branchSalespersonId,
            'order:cancellation_rejected',
            eventData
          );
          emitToSalesperson(
            branchSalespersonId,
            'order:status_updated',
            eventData
          );
        }

        if (populatedOrder?.customer_id?.email) {
          await sendEmail(
            populatedOrder.customer_id.email,
            `Philbox - Cancellation Request Update for Order #${String(order._id)}`,
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1f2937;">Cancellation Request Rejected</h2>
                <p>Dear ${populatedOrder.customer_id.fullName || populatedOrder.customer_id.name || 'Valued Customer'},</p>
                <p>Your cancellation request for order <strong>#${String(order._id)}</strong> was rejected.</p>
                <p>Reason: <strong>${order.cancellation_review_reason}</strong></p>
                <p>You can continue tracking the order in your account.</p>
                <p>Thank you,<br/>Philbox Support</p>
              </div>
            `
          );
        }

        if (populatedOrder?.customer_id?.phone) {
          await notificationService.sendSMS(
            populatedOrder.customer_id.phone,
            `Your cancellation request for order #${String(order._id)} was rejected. Reason: ${order.cancellation_review_reason}`
          );
        }
      } catch (notificationError) {
        console.error(
          'Error sending order cancellation rejection notifications:',
          notificationError
        );
      }

      return {
        order_id: order._id,
        status: order.status,
        cancellation_request_status: order.cancellation_request_status,
        cancellation_review_reason: order.cancellation_review_reason,
        message: 'Cancellation request rejected successfully.',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async reorderOrder(customerId, orderId) {
    const order = await Order.findOne({ _id: orderId, customer_id: customerId })
      .populate({
        path: 'order_items',
        populate: {
          path: 'medicine_id',
          select: '_id Name sale_price active',
        },
      })
      .lean();

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const reusableItems = (order.order_items || []).filter(
      item => item.medicine_id?._id && item.quantity > 0
    );

    if (!reusableItems.length) {
      throw new Error('ORDER_ITEMS_NOT_AVAILABLE');
    }

    const cartResults = [];
    for (const item of reusableItems) {
      const cartResult = await cartService.addToCart(customerId, {
        medicineId: item.medicine_id._id,
        quantity: item.quantity,
      });

      cartResults.push({
        medicine_id: item.medicine_id._id,
        medicine_name: item.medicine_id.Name,
        quantity: item.quantity,
        cart: cartResult,
      });
    }

    const latestCart = cartResults[cartResults.length - 1]?.cart || null;

    return {
      order_id: order._id,
      order_reference: String(order._id),
      reordered_items: cartResults.length,
      items: cartResults,
      cart: latestCart,
      message: 'Order items added to cart successfully.',
    };
  }

  async createOrderReview(customerId, orderId, payload = {}) {
    const { rating, message } = payload;

    const order = await Order.findOne({ _id: orderId, customer_id: customerId })
      .populate('order_items', '_id')
      .lean();

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (order.status !== 'completed') {
      throw new Error('ORDER_NOT_COMPLETED');
    }

    const existingReview = await Review.findOne({
      customer_id: customerId,
      target_type: 'order',
      target_id: order._id,
    }).lean();

    if (existingReview) {
      throw new Error('REVIEW_ALREADY_EXISTS');
    }

    const normalizedRating = Number(rating);
    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      throw new Error('INVALID_RATING');
    }

    if (!String(message || '').trim()) {
      throw new Error('REVIEW_MESSAGE_REQUIRED');
    }

    const sentiment = await this._predictSentiment(message);

    const review = await Review.create({
      customer_id: customerId,
      target_type: 'order',
      target_id: order._id,
      rating: normalizedRating,
      message: String(message).trim(),
      sentiment,
    });

    return review;
  }

  async _predictSentiment(reviewText) {
    try {
      const response = await axios.post(
        SENTIMENT_API_URL,
        { review: String(reviewText || '') },
        { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
      );

      const predictedSentiment = String(
        response.data?.sentiment ||
          response.data?.label ||
          response.data?.prediction ||
          response.data?.result ||
          'neutral'
      )
        .toLowerCase()
        .trim();

      if (['positive', 'negative', 'neutral'].includes(predictedSentiment)) {
        return predictedSentiment;
      }

      return 'neutral';
    } catch (error) {
      console.error('Sentiment prediction failed:', error.message);
      return 'neutral';
    }
  }

  _hasValue(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  }

  _pickDefinedFields(source = {}) {
    const output = {};
    for (const [key, value] of Object.entries(source)) {
      if (this._hasValue(value)) {
        output[key] = value;
      }
    }
    return output;
  }

  _buildCancellationSummary(order) {
    const requestStatus = order.cancellation_request_status || 'none';
    const cancellationRelevant =
      requestStatus !== 'none' ||
      this._hasValue(order.cancellation_reason) ||
      this._hasValue(order.cancelled_at);

    if (!cancellationRelevant) return null;

    return this._pickDefinedFields({
      request_status: requestStatus,
      cancellation_reason: order.cancellation_reason,
      requested_reason: order.cancellation_requested_reason,
      requested_at: order.cancellation_requested_at,
      review_reason: order.cancellation_review_reason,
      reviewed_by: order.cancellation_reviewed_by,
      reviewed_at: order.cancellation_reviewed_at,
      cancelled_at: order.cancelled_at,
    });
  }

  _formatOrder(order, delivery = null, transaction = null, options = {}) {
    const orderItems = Array.isArray(order.order_items)
      ? order.order_items
      : [];
    const subtotal = to2(
      orderItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
    );
    const totalAfterCoupon = to2(
      Number(order.total_after_applying_coupon ?? order.total ?? 0)
    );

    const items = orderItems.map(item =>
      this._pickDefinedFields({
        _id: item._id,
        medicine: item.medicine_id || null,
        branch: item.branch_id || null,
        medicine_name: item.medicine_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        prescription_file_url: item.prescription_file_url || null,
      })
    );

    const hasPrescriptionItems = items.some(item =>
      this._hasValue(item.prescription_file_url)
    );

    const cancellation = this._buildCancellationSummary(order);

    const payload = {
      _id: order._id,
      total: to2(Number(order.total || 0)),
      subtotal,
      total_after_applying_coupon: totalAfterCoupon,
      status: order.status,
      refund_status: order.refund_status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      branch: order.branch_id || null,
      items,
      item_count: orderItems.length,
      delivery: delivery
        ? {
            order_id: delivery.order_id,
            calculated_fare: Number(delivery.calculated_fare || 0),
            google_address_link: delivery.google_address_link || null,
            created_at: delivery.created_at,
            updated_at: delivery.updated_at,
          }
        : null,
      transaction: transaction
        ? {
            _id: transaction._id,
            total_bill: transaction.total_bill,
            payment_status: transaction.payment_status,
            payment_method: transaction.payment_method,
            wallet_number: transaction.wallet_number || null,
            country: transaction.country || null,
            invoice_url: transaction.invoice_url || null,
            transaction_at: transaction.transaction_at,
            currency: transaction.currency || null,
            stripe_payment_intent_id:
              transaction.stripe_payment_intent_id || null,
            gateway_transaction_id: transaction.gateway_transaction_id || null,
          }
        : null,
      detailed: Boolean(options.detailed),
      invoice_data: options.invoice_data || null,
    };

    if (this._hasValue(order.coupon_id)) {
      payload.coupon = order.coupon_id;
    }

    if (this._hasValue(cancellation)) {
      payload.cancellation = cancellation;
    }

    if (this._hasValue(order.refund_transaction_id)) {
      payload.refund_transaction_id = order.refund_transaction_id;
    }

    if (this._hasValue(options.invoice_url || order.invoice_url)) {
      payload.invoice_url = options.invoice_url || order.invoice_url;
    }

    if (hasPrescriptionItems) {
      payload.has_prescription_items = true;
    }

    if (payload.delivery) {
      payload.delivery = this._pickDefinedFields(payload.delivery);
    }

    if (payload.transaction) {
      payload.transaction = this._pickDefinedFields(payload.transaction);
    }

    if (!payload.detailed && !this._hasValue(payload.invoice_data)) {
      delete payload.invoice_data;
    }

    return payload;
  }
}

export default new CustomerOrderManagementService();
