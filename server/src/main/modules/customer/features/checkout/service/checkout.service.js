import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import Stripe from 'stripe';
import Cart from '../../../../../models/Cart.js';
import CartItem from '../../../../../models/CartItem.js';
import Customer from '../../../../../models/Customer.js';
import Address from '../../../../../models/Address.js';
import Branch from '../../../../../models/Branch.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Medicine from '../../../../../models/Medicine.js';
import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import MedicineSalesAnalytics from '../../../../../models/MedicineSalesAnalytics.js';
import Coupon from '../../../../../models/Coupon.js';
import DeliveryFare from '../../../../../models/DeliveryFare.js';
import Delivery from '../../../../../models/Delivery.js';
import PrescriptionUploadedByCustomer from '../../../../../models/PrescriptionUploadedByCustomer.js';
import Transaction from '../../../../../models/Transaction.js';
import Currency from '../../../../../models/Currency.js';
import { uploadToCloudinary } from '../../../../../utils/uploadToCloudinary.js';
import { sendEmail } from '../../../../../utils/sendEmail.js';
import notificationService from '../../../../../utils/notificationService.js';
import {
  emitToBranch,
  emitToSalesperson,
} from '../../../../../config/socket.config.js';
import { ORDER_CONFIRMATION_TEMPLATE } from '../../../../../constants/global.mail.constants.js';
import salespersonOrderProcessingService from '../../../../../modules/salesperson/features/order_processing/service/orderProcessing.service.js';
import {
  extractCoordinatesFromMapLinkWithResolution,
  calculateRoadDistance,
  calculateLocationProximityScore,
} from '../../../../../utils/proximityCalculator.js';

const to2 = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const safeString = value => String(value ?? '').trim();

class CheckoutService {
  async createStripeTestPaymentMethod({
    cardNumber,
    expMonth,
    expYear,
    cvc,
    name,
  }) {
    return {
      provider: 'stripe',
      payment_method_id: 'pm_card_visa',
      status: 'ready',
      source: 'stripe_test_payment_method',
      note: 'Stripe raw card APIs are not available in this environment. Use the built-in test PaymentMethod id pm_card_visa for checkout testing.',
    };
  }

  async _ensureStockAvailable(itemsByBranch) {
    for (const [branchId, items] of itemsByBranch.entries()) {
      for (const item of items) {
        const quantity = Number(item.quantity) || 0;

        if (quantity <= 0) {
          throw new Error('INSUFFICIENT_STOCK_FOR_CHECKOUT');
        }

        const stockRecord = await StockInHand.findOne({
          branch_id: branchId,
          medicine_id: item.medicine_id._id,
          quantity: { $gte: quantity },
        })
          .select('_id')
          .lean();

        if (!stockRecord) {
          throw new Error('INSUFFICIENT_STOCK_FOR_CHECKOUT');
        }
      }
    }
  }

  async _processJazzCashPayment({
    amount,
    walletNumber,
    reference,
    customerId,
  }) {
    const apiUrl = process.env.JAZZCASH_API_URL;
    const merchantId = process.env.JAZZCASH_MERCHANT_ID;
    const merchantPassword = process.env.JAZZCASH_MERCHANT_PASSWORD;
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

    if (!apiUrl || !merchantId || !merchantPassword || !integritySalt) {
      throw new Error('JAZZCASH_NOT_CONFIGURED');
    }

    if (!safeString(walletNumber)) {
      throw new Error('WALLET_NUMBER_REQUIRED');
    }

    const amountPaisa = toSmallestUnit(amount);
    const timestamp = Date.now().toString();
    const signature = buildRequestSignature({
      secret: integritySalt,
      parts: [
        merchantId,
        merchantPassword,
        reference,
        amountPaisa,
        walletNumber,
        timestamp,
      ],
    });

    const payload = {
      merchant_id: merchantId,
      merchant_password: merchantPassword,
      merchant_reference: reference,
      amount: amountPaisa,
      currency: 'PKR',
      wallet_number: walletNumber,
      customer_id: String(customerId),
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
      throw new Error('JAZZCASH_PAYMENT_FAILED');
    }

    return {
      provider: 'jazzcash',
      transactionId:
        response.data?.gateway_transaction_id ||
        response.data?.transaction_id ||
        response.data?.pp_TxnRefNo ||
        reference,
      status: 'successful',
      raw: response.data,
    };
  }

  async _processEasyPaisaPayment({
    amount,
    walletNumber,
    reference,
    customerId,
  }) {
    const apiUrl = process.env.EASYPAISA_API_URL;
    const storeId = process.env.EASYPAISA_STORE_ID;
    const hashKey = process.env.EASYPAISA_HASH_KEY;

    if (!apiUrl || !storeId || !hashKey) {
      throw new Error('EASYPAISA_NOT_CONFIGURED');
    }

    if (!safeString(walletNumber)) {
      throw new Error('WALLET_NUMBER_REQUIRED');
    }

    const amountPaisa = toSmallestUnit(amount);
    const timestamp = Date.now().toString();
    const signature = buildRequestSignature({
      secret: hashKey,
      parts: [storeId, reference, amountPaisa, walletNumber, timestamp],
    });

    const payload = {
      store_id: storeId,
      merchant_reference: reference,
      amount: amountPaisa,
      currency: 'PKR',
      wallet_number: walletNumber,
      customer_id: String(customerId),
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
      throw new Error('EASYPAISA_PAYMENT_FAILED');
    }

    return {
      provider: 'easypaisa',
      transactionId:
        response.data?.gateway_transaction_id ||
        response.data?.transaction_id ||
        response.data?.transactionRef ||
        reference,
      status: 'successful',
      raw: response.data,
    };
  }

  async _processPayment({
    customerId,
    paymentMethod,
    amount,
    walletNumber,
    stripePaymentMethodId,
    reference,
  }) {
    if (paymentMethod === 'stripe') {
      return this._processStripePayment({
        amount,
        stripePaymentMethodId,
        reference,
      });
    }

    if (paymentMethod === 'jazzcash') {
      return this._processJazzCashPayment({
        amount,
        walletNumber,
        reference,
        customerId,
      });
    }

    if (paymentMethod === 'easypaisa') {
      return this._processEasyPaisaPayment({
        amount,
        walletNumber,
        reference,
        customerId,
      });
    }

    throw new Error('INVALID_PAYMENT_METHOD');
  }

  _getDominantBranchId(itemsByBranch) {
    let dominantBranchId = null;
    let dominantWeight = -1;

    for (const [branchId, items] of itemsByBranch.entries()) {
      const weight = items.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      );

      if (weight > dominantWeight) {
        dominantWeight = weight;
        dominantBranchId = branchId;
      }
    }

    return dominantBranchId;
  }

  async _rotateSalespersonForBranch(branchId, session) {
    if (!branchId) {
      return null;
    }

    const branch = await Branch.findById(branchId)
      .select('salespersons_assigned salesperson_assignment_cursor')
      .session(session);

    const salespersons =
      branch?.salespersons_assigned?.map(id => id.toString()).filter(Boolean) ||
      [];

    if (!branch || !salespersons.length) {
      return null;
    }

    const currentCursor = Number(branch.salesperson_assignment_cursor || 0);
    const nextIndex = currentCursor % salespersons.length;
    const salespersonId = salespersons[nextIndex];

    branch.salesperson_assignment_cursor =
      (nextIndex + 1) % salespersons.length;
    await branch.save({ session });

    return salespersonId;
  }

  async _peekSalespersonForBranch(branchId) {
    if (!branchId) {
      return null;
    }

    const branch = await Branch.findById(branchId)
      .select('salespersons_assigned salesperson_assignment_cursor')
      .lean();

    const salespersons =
      branch?.salespersons_assigned?.map(id => id.toString()).filter(Boolean) ||
      [];

    if (!branch || !salespersons.length) {
      return null;
    }

    const currentCursor = Number(branch.salesperson_assignment_cursor || 0);
    return salespersons[currentCursor % salespersons.length];
  }

  async _getCustomerAddress(customerId, addressId) {
    if (addressId) {
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new Error('INVALID_ADDRESS_ID');
      }

      const selectedAddress = await Address.findById(addressId).lean();
      if (!selectedAddress) throw new Error('ADDRESS_NOT_FOUND');
      return selectedAddress;
    }

    const customer = await Customer.findById(customerId).populate('address_id');
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');
    if (!customer.address_id) throw new Error('CUSTOMER_ADDRESS_NOT_FOUND');

    const addr =
      typeof customer.address_id.toObject === 'function'
        ? customer.address_id.toObject()
        : customer.address_id;

    return addr;
  }

  async _resolveDeliveryAddress(
    customerId,
    { address_id, delivery_google_map_link } = {}
  ) {
    const newMapLink = safeString(delivery_google_map_link);

    if (address_id) {
      const selectedAddress = await this._getCustomerAddress(
        customerId,
        address_id
      );
      return {
        ...selectedAddress,
        google_map_link: newMapLink || selectedAddress.google_map_link,
      };
    }

    if (!newMapLink) {
      return this._getCustomerAddress(customerId, address_id);
    }

    const customer = await Customer.findById(customerId).populate('address_id');
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    const baseAddress = customer.address_id
      ? typeof customer.address_id.toObject === 'function'
        ? customer.address_id.toObject()
        : customer.address_id
      : {};

    return {
      ...baseAddress,
      google_map_link: newMapLink,
    };
  }

  async _getCartContext(customerId) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id')
      .lean();
    if (!cart) throw new Error('CART_EMPTY');

    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate('medicine_id')
      .populate({ path: 'branch_id', populate: { path: 'address_id' } })
      .lean();

    if (!cartItems.length) throw new Error('CART_EMPTY');

    return { cart, cartItems };
  }

  async _resolveCoupon(couponCode) {
    if (!couponCode) return null;

    const coupon = await Coupon.findOne({
      cupon_code: String(couponCode).toUpperCase(),
    });
    if (!coupon) throw new Error('INVALID_COUPON');
    if (!coupon.is_active) throw new Error('COUPON_INACTIVE');
    if (coupon.expiry_time < new Date()) throw new Error('COUPON_EXPIRED');
    if (coupon.for !== 'medicine') throw new Error('COUPON_TYPE_MISMATCH');
    if (coupon.max_use_limit && coupon.times_used >= coupon.max_use_limit) {
      throw new Error('COUPON_USAGE_LIMIT_REACHED');
    }

    return coupon;
  }

  async _resolveFareForDistance(distanceKm) {
    const activeFares = await DeliveryFare.find({ is_active: true })
      .sort({ min_distance_km: 1 })
      .lean();

    if (!activeFares.length) {
      throw new Error('DELIVERY_FARE_NOT_CONFIGURED');
    }

    const exact = activeFares.find(fare => {
      const min = Number(fare.min_distance_km || 0);
      const max =
        fare.max_distance_km == null
          ? Number.POSITIVE_INFINITY
          : Number(fare.max_distance_km);
      return distanceKm >= min && distanceKm < max;
    });

    if (exact) return Number(exact.fare_amount) || 0;

    const fallback = activeFares[activeFares.length - 1];
    return Number(fallback.fare_amount) || 0;
  }

  async _buildCheckoutSummary(
    customerId,
    { address_id, coupon_code, delivery_google_map_link } = {}
  ) {
    const deliveryAddress = await this._resolveDeliveryAddress(customerId, {
      address_id,
      delivery_google_map_link,
    });
    const { cartItems } = await this._getCartContext(customerId);

    const validItems = cartItems.filter(
      item => item.medicine_id && item.branch_id
    );
    if (!validItems.length) throw new Error('CART_EMPTY');

    const subtotal = to2(
      validItems.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const unit = Number(item.medicine_id.sale_price) || 0;
        return sum + qty * unit;
      }, 0)
    );

    const needsPrescription = validItems.some(item =>
      Boolean(item.medicine_id?.prescription_required)
    );

    const branchMap = new Map();
    for (const item of validItems) {
      const branchId = String(item.branch_id._id);
      if (!branchMap.has(branchId)) {
        branchMap.set(branchId, item.branch_id);
      }
    }

    const fareDetails = [];
    const deliveryCoordinates =
      await extractCoordinatesFromMapLinkWithResolution(
        deliveryAddress?.google_map_link
      );

    for (const branch of branchMap.values()) {
      let distanceKm = 25;
      let distanceMethod = 'default_fallback';

      const branchAddress = branch?.address_id || null;
      const deliveryMapLink = safeString(deliveryAddress?.google_map_link);
      const branchMapLink = safeString(branchAddress?.google_map_link);
      const branchCoordinates =
        await extractCoordinatesFromMapLinkWithResolution(
          branchAddress?.google_map_link
        );

      if (deliveryCoordinates && branchCoordinates) {
        const city = deliveryAddress?.city || branchAddress?.city;
        const calculatedDistance = calculateRoadDistance(
          deliveryCoordinates,
          branchCoordinates,
          city
        );

        if (
          calculatedDistance > 0 ||
          !deliveryMapLink ||
          !branchMapLink ||
          deliveryMapLink === branchMapLink
        ) {
          distanceKm = calculatedDistance;
          distanceMethod = 'road_distance';
        } else if (deliveryAddress && branchAddress) {
          const locationScore = calculateLocationProximityScore(
            deliveryAddress,
            branchAddress
          );
          distanceKm = this._estimateDistanceFromLocationScore(locationScore);
          distanceMethod = 'location_hierarchy_estimate';
        }
      } else if (deliveryAddress && branchAddress) {
        const locationScore = calculateLocationProximityScore(
          deliveryAddress,
          branchAddress
        );
        distanceKm = this._estimateDistanceFromLocationScore(locationScore);
        distanceMethod = 'location_hierarchy_estimate';
      }

      const fareAmount = await this._resolveFareForDistance(distanceKm);
      fareDetails.push({
        distance_km: to2(distanceKm),
        distance_method: distanceMethod,
        fare_amount: to2(fareAmount),
      });
    }

    const averageDeliveryFare =
      fareDetails.length > 0
        ? to2(
            fareDetails.reduce(
              (sum, row) => sum + Number(row.fare_amount || 0),
              0
            ) / fareDetails.length
          )
        : 0;

    const coupon = await this._resolveCoupon(coupon_code);
    const discountPercent = coupon ? Number(coupon.percent_off) || 0 : 0;
    const discountAmount = to2((subtotal * discountPercent) / 100);

    const grandTotal = to2(subtotal + averageDeliveryFare - discountAmount);

    return {
      summary: {
        subtotal,
        delivery_charges: averageDeliveryFare,
        discount_amount: discountAmount,
        total: grandTotal,
      },
      delivery_address: {
        address_id: address_id || deliveryAddress?._id || null,
        google_map_link: deliveryAddress?.google_map_link || null,
      },
      coupon: coupon
        ? {
            _id: coupon._id,
            cupon_code: coupon.cupon_code,
            percent_off: coupon.percent_off,
          }
        : null,
      payment_methods: ['jazzcash', 'easypaisa', 'stripe'],
      requires_prescription: needsPrescription,
      fare_details: fareDetails,
      cart_items: validItems.map(item => ({
        cart_item_id: item._id,
        medicine_id: item.medicine_id._id,
        medicine_name: item.medicine_id.Name,
        quantity: item.quantity,
        unit_price: item.medicine_id.sale_price,
        prescription_required: Boolean(item.medicine_id.prescription_required),
      })),
    };
  }

  async getCheckoutSummary(customerId, query = {}) {
    return this._buildCheckoutSummary(customerId, query);
  }

  async getInvoiceData(customerId, orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const order = await Order.findOne({ _id: orderId, customer_id: customerId })
      .populate('customer_id', 'fullName name email phone')
      .populate({
        path: 'branch_id',
        select: 'name branch_name code branch_code phone',
      })
      .populate('coupon_id', 'cupon_code percent_off')
      .populate({
        path: 'order_items',
        populate: {
          path: 'medicine_id',
          select: 'Name category prescription_required',
        },
      })
      .lean();

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const transaction = await Transaction.findOne({
      target_class: 'order',
      target_id: order._id,
      transaction_type: 'pay',
    })
      .populate('currency', 'code symbol')
      .lean();

    return {
      order,
      transaction,
    };
  }

  async uploadPrescription(customerId, file, notes = null) {
    if (!file) throw new Error('PRESCRIPTION_FILE_REQUIRED');

    let dominantBranchId = null;
    let targetSalespersonId = null;

    try {
      const { cartItems } = await this._getCartContext(customerId);
      const validItems = cartItems.filter(
        item => item.medicine_id && item.branch_id
      );
      const itemsByBranch = new Map();

      for (const item of validItems) {
        const key = String(item.branch_id._id);
        if (!itemsByBranch.has(key)) itemsByBranch.set(key, []);
        itemsByBranch.get(key).push(item);
      }

      dominantBranchId = this._getDominantBranchId(itemsByBranch);
      targetSalespersonId =
        await this._peekSalespersonForBranch(dominantBranchId);
    } catch (error) {
      console.warn(
        'Unable to resolve prescription review target:',
        error.message
      );
    }

    const prescriptionUrl = await uploadToCloudinary(
      file.path,
      'customer/prescriptions'
    );

    const record = await PrescriptionUploadedByCustomer.create({
      patient_id: customerId,
      prescription_url: prescriptionUrl,
      prescription_type: 'for-order',
      branch_id: dominantBranchId || undefined,
      salesperson_id: targetSalespersonId || undefined,
      review_status: 'pending',
      notes: notes || undefined,
    });

    const recordObject = record.toObject();

    if (targetSalespersonId) {
      emitToSalesperson(targetSalespersonId, 'new_prescription_available', {
        prescription_id: String(recordObject._id),
        customer_id: String(customerId),
        branch_id: dominantBranchId,
        prescription_type: recordObject.prescription_type || 'for-order',
        review_status: recordObject.review_status || 'pending',
        notes: recordObject.notes || '',
        created_at: recordObject.created_at,
      });
    } else if (dominantBranchId) {
      emitToBranch(dominantBranchId, 'new_prescription_available', {
        prescription_id: String(recordObject._id),
        customer_id: String(customerId),
        branch_id: dominantBranchId,
        prescription_type: recordObject.prescription_type || 'for-order',
        review_status: recordObject.review_status || 'pending',
        notes: recordObject.notes || '',
        created_at: recordObject.created_at,
      });
    }

    return recordObject;
  }

  async placeOrder(customerId, payload = {}) {
    const {
      address_id,
      delivery_google_map_link,
      coupon_code,
      payment_method,
      wallet_number,
      stripe_payment_method_id,
      prescription_id,
      notes,
      ipAddress,
      device_details,
      country,
    } = payload;

    const checkout = await this._buildCheckoutSummary(customerId, {
      address_id,
      delivery_google_map_link,
      coupon_code,
    });

    if (!safeString(checkout.delivery_address?.google_map_link)) {
      throw new Error('DELIVERY_GOOGLE_MAP_LINK_REQUIRED');
    }

    let prescription = null;
    if (checkout.requires_prescription) {
      if (
        !prescription_id ||
        !mongoose.Types.ObjectId.isValid(prescription_id)
      ) {
        throw new Error('PRESCRIPTION_REQUIRED');
      }

      prescription = await PrescriptionUploadedByCustomer.findOne({
        _id: prescription_id,
        patient_id: customerId,
      });

      if (!prescription) {
        throw new Error('PRESCRIPTION_NOT_FOUND');
      }
    }

    const currency =
      (await Currency.findOne({ code: 'PKR' }).lean()) ||
      (await Currency.findOne({}).lean());

    if (!currency) {
      throw new Error('CURRENCY_NOT_CONFIGURED');
    }

    const paymentMethodValue = PAYMENT_METHOD_MAP[payment_method];
    if (!paymentMethodValue) {
      throw new Error('INVALID_PAYMENT_METHOD');
    }

    const { cart, cartItems } = await this._getCartContext(customerId);
    const validItems = cartItems.filter(
      item => item.medicine_id && item.branch_id
    );

    const subtotal = Number(checkout.summary.subtotal) || 0;
    const deliveryCharges = Number(checkout.summary.delivery_charges) || 0;
    const discountAmount = Number(checkout.summary.discount_amount) || 0;
    const coupon = checkout.coupon
      ? await Coupon.findById(checkout.coupon._id)
      : null;

    const itemsByBranch = new Map();
    for (const item of validItems) {
      const key = String(item.branch_id._id);
      if (!itemsByBranch.has(key)) itemsByBranch.set(key, []);
      itemsByBranch.get(key).push(item);
    }

    if (!validItems.length || !itemsByBranch.size) {
      throw new Error('NO_VALID_CART_ITEMS_FOR_CHECKOUT');
    }

    await this._ensureStockAvailable(itemsByBranch);

    const checkoutReference = `checkout_${customerId}_${Date.now()}`;
    const paymentResult = await this._processPayment({
      customerId,
      paymentMethod: payment_method,
      amount: checkout.summary.total,
      walletNumber: wallet_number,
      stripePaymentMethodId: stripe_payment_method_id,
      reference: checkoutReference,
    });

    const dominantBranchId = this._getDominantBranchId(itemsByBranch);
    const orderSubtotal = to2(subtotal);
    const orderTotalBeforeDiscount = to2(orderSubtotal + deliveryCharges);
    const orderTotalAfterDiscount = to2(
      Math.max(orderTotalBeforeDiscount - discountAmount, 0)
    );

    const session = await mongoose.startSession();
    const placedOrders = [];
    const transactions = [];
    const deliveries = [];
    try {
      session.startTransaction();

      const assignedSalespersonId = await this._rotateSalespersonForBranch(
        dominantBranchId,
        session
      );

      const order = await Order.create(
        [
          {
            customer_id: customerId,
            branch_id: dominantBranchId,
            salesperson_id: assignedSalespersonId || undefined,
            total: orderTotalBeforeDiscount,
            status: 'pending',
            order_items: [],
            coupon_id: coupon?._id,
            total_after_applying_coupon: orderTotalAfterDiscount,
          },
        ],
        { session }
      );

      const orderDoc = order[0];
      const createdItemIds = [];

      for (const item of validItems) {
        const branchId = item.branch_id._id.toString();
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.medicine_id.sale_price) || 0;

        const stockRecord = await StockInHand.findOne({
          branch_id: branchId,
          medicine_id: item.medicine_id._id,
          quantity: { $gte: quantity },
        })
          .sort({ quantity: -1 })
          .session(session);

        if (!stockRecord) {
          throw new Error('INSUFFICIENT_STOCK_FOR_CHECKOUT');
        }

        stockRecord.quantity = Math.max(
          0,
          Number(stockRecord.quantity) - quantity
        );
        await stockRecord.save({ session });

        const orderItem = await OrderItem.create(
          [
            {
              order_id: orderDoc._id,
              medicine_id: item.medicine_id._id,
              branch_id: branchId,
              quantity,
              price: unitPrice,
              medicine_name: item.medicine_id.Name,
              subtotal: to2(quantity * unitPrice),
              prescription_file_url: item.medicine_id.prescription_required
                ? prescription?.prescription_url
                : undefined,
            },
          ],
          { session }
        );

        await Medicine.updateOne(
          { _id: item.medicine_id._id },
          {
            $inc: {
              quantity_sold: quantity,
              revenue_generated: to2(quantity * unitPrice),
            },
          },
          { session }
        );

        createdItemIds.push(orderItem[0]._id);
      }

      orderDoc.order_items = createdItemIds;
      orderDoc.invoice_url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/customer/checkout/download-invoice/${orderDoc._id}`;
      await orderDoc.save({ session });

      const transaction = await Transaction.create(
        [
          {
            target_class: 'order',
            target_id: orderDoc._id,
            total_bill: orderTotalAfterDiscount,
            transaction_type: 'pay',
            currency: currency._id,
            payment_status: 'successful',
            payment_method: paymentMethodValue,
            stripe_payment_intent_id:
              payment_method === 'stripe'
                ? paymentResult.transactionId
                : undefined,
            gateway_transaction_id:
              payment_method !== 'stripe'
                ? paymentResult.transactionId
                : undefined,
            wallet_number:
              payment_method !== 'stripe'
                ? wallet_number || undefined
                : undefined,
            device_details: device_details || 'checkout-api',
            country: country || 'PK',
            ipAddress: ipAddress || undefined,
          },
        ],
        { session }
      );

      const delivery = await Delivery.create(
        [
          {
            order_id: orderDoc._id,
            customer_id: customerId,
            google_address_link:
              checkout.delivery_address?.google_map_link || '',
            calculated_fare: deliveryCharges,
          },
        ],
        { session }
      );

      placedOrders.push(orderDoc);
      transactions.push(transaction[0]);
      deliveries.push(delivery[0]);

      if (placedOrders.length) {
        const medicineSalesAnalyticsRows = [];

        for (const order of placedOrders) {
          const orderItemsForAnalytics = await OrderItem.find({
            order_id: order._id,
          })
            .select('medicine_id branch_id quantity')
            .lean();

          for (const item of orderItemsForAnalytics) {
            medicineSalesAnalyticsRows.push({
              order_id: order._id,
              medicine_id: item.medicine_id,
              branch_id: item.branch_id,
              date: new Date(),
              quantity: item.quantity,
            });
          }
        }

        if (medicineSalesAnalyticsRows.length) {
          await MedicineSalesAnalytics.insertMany(medicineSalesAnalyticsRows, {
            session,
          });
        }
      }

      if (coupon) {
        coupon.times_used = (coupon.times_used || 0) + 1;
        await coupon.save({ session });
      }

      await CartItem.deleteMany({ cart_id: cart._id }).session(session);
      await Cart.findByIdAndUpdate(
        cart._id,
        {
          total: 0,
          items: [],
        },
        { session }
      );

      if (prescription && placedOrders.length) {
        prescription.order_id = placedOrders[0]._id;
        prescription.notes = notes || prescription.notes;
        await prescription.save({ session });
      }

      await session.commitTransaction();

      // Send order confirmation emails and SMS asynchronously after transaction commits
      const customer = await Customer.findById(customerId).lean();
      if (customer && customer.email) {
        for (const order of placedOrders) {
          try {
            // Check if order needs processing and emit real-time notification to salespersons
            try {
              const shouldProcess =
                await salespersonOrderProcessingService.shouldOrderBeProcessed(
                  order._id
                );
              if (shouldProcess) {
                // Populate order with processing info before emitting
                const populatedOrder = await Order.findById(order._id)
                  .populate('customer_id', 'fullName email phone')
                  .populate({
                    path: 'order_items',
                    populate: {
                      path: 'medicine_id',
                      select: 'prescription_required Name',
                    },
                  })
                  .lean();

                // Determine reason for processing
                const itemsNeedingPrescription =
                  populatedOrder.order_items.filter(
                    item => item.medicine_id?.prescription_required === true
                  );
                const branches = new Set(
                  populatedOrder.order_items.map(item =>
                    item.branch_id?.toString()
                  )
                );
                const isMultiBranch = branches.size > 1;

                const assignedSalespersonId =
                  order.salesperson_id?.toString?.() ||
                  String(order.salesperson_id || '');

                populatedOrder.processing_info = {
                  items_needing_prescription: itemsNeedingPrescription,
                  is_multi_branch: isMultiBranch,
                  dominant_branch_id:
                    order.branch_id?.toString?.() || dominantBranchId,
                  assigned_salesperson_id: assignedSalespersonId || null,
                  reason_for_processing: isMultiBranch
                    ? 'Multi-branch order requires coordination'
                    : 'Contains prescription-required items',
                };

                const targetSalespersonIds = assignedSalespersonId
                  ? [assignedSalespersonId]
                  : [];

                if (!targetSalespersonIds.length) {
                  const branch = await Branch.findById(order.branch_id)
                    .select('salespersons_assigned')
                    .lean();

                  targetSalespersonIds.push(
                    ...(
                      branch?.salespersons_assigned?.map(id => id.toString()) ||
                      []
                    ).slice(0, 1)
                  );
                }

                for (const salespersonId of targetSalespersonIds) {
                  emitToSalesperson(
                    salespersonId,
                    'new_order_available',
                    populatedOrder
                  );
                }
              }
            } catch (processingError) {
              console.error(
                'Error checking/emitting order processing notification:',
                processingError
              );
              // Don't throw - notification failure shouldn't block order creation
            }

            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const trackOrderLink = `${baseUrl}/customer/orders/${order._id}`;

            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
            const orderConfirmationHtml = ORDER_CONFIRMATION_TEMPLATE.replace(
              '{{NAME}}',
              customer.fullName || customer.name || 'Valued Customer'
            )
              .replace('{{ORDER_ID}}', String(order._id))
              .replace(
                '{{TOTAL_AMOUNT}}',
                String(order.total_after_applying_coupon)
              )
              .replace(
                '{{ESTIMATED_DELIVERY}}',
                estimatedDelivery.toLocaleDateString('en-PK')
              )
              .replace('{{TRACK_LINK}}', trackOrderLink);

            await sendEmail(
              customer.email,
              'Philbox - Order Confirmation',
              orderConfirmationHtml
            );

            // Send SMS if phone number exists
            if (customer.phone) {
              const orderSMS = `Your Philbox order #${String(order._id)} has been confirmed! Total: PKR ${order.total_after_applying_coupon}. Track: ${trackOrderLink}`;
              await notificationService.sendSMS(customer.phone, orderSMS);
            }
          } catch (emailError) {
            console.error(
              'Error sending order confirmation email/SMS or order processing notification:',
              emailError
            );
            // Don't throw - email failure shouldn't block order creation
          }
        }
      }

      const deliveryFareByOrderId = new Map(
        deliveries.map(delivery => [
          String(delivery.order_id),
          Number(delivery.calculated_fare || 0),
        ])
      );

      return {
        orders: placedOrders.map(order => ({
          _id: order._id,
          total: order.total,
          invoice_url: order.invoice_url,
          delivery_charges:
            deliveryFareByOrderId.get(String(order._id)) ?? perBranchDelivery,
          total_after_applying_coupon: order.total_after_applying_coupon,
          status: order.status,
          created_at: order.created_at,
        })),
        transactions,
        deliveries,
        payment: {
          provider: paymentResult.provider,
          transaction_id: paymentResult.transactionId,
          status: paymentResult.status,
        },
        checkout_summary: checkout.summary,
        coupon_applied: checkout.coupon,
        customer_notification: {
          email_sent: !!customer?.email,
          sms_sent: !!customer?.phone,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new CheckoutService();
