import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import Medicine from '../../../../../models/Medicine.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Branch from '../../../../../models/Branch.js';
import Customer from '../../../../../models/Customer.js';
import { rankBranchesByProximity } from '../../../../../utils/proximityCalculator.js';

class CustomerCartService {
  constructor() {
    this.taxRate = this._resolveTaxRate();
  }

  _resolveTaxRate() {
    const raw = Number(process.env.CART_TAX_RATE ?? 0);
    if (Number.isNaN(raw) || raw < 0) return 0;

    if (raw > 1 && raw <= 100) {
      return raw / 100;
    }

    if (raw > 1) return 0;
    return raw;
  }

  _roundTo2(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  _normalizeCity(value) {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _buildEquivalentMedicineQuery(medicine) {
    const query = {
      is_available: true,
      Name: {
        $regex: `^${this._escapeRegex(medicine.Name || '')}$`,
        $options: 'i',
      },
    };

    if (medicine.alias_name) {
      query.alias_name = {
        $regex: `^${this._escapeRegex(medicine.alias_name)}$`,
        $options: 'i',
      };
    }

    if (medicine.mgs) {
      query.mgs = {
        $regex: `^${this._escapeRegex(medicine.mgs)}$`,
        $options: 'i',
      };
    }

    if (medicine.medicine_category) {
      query.medicine_category = {
        $regex: `^${this._escapeRegex(medicine.medicine_category)}$`,
        $options: 'i',
      };
    }

    return query;
  }

  _getAllocationMessage(requestedQuantity, allocations, remainingQuantity) {
    const addedQuantity = allocations.reduce(
      (sum, item) => sum + item.allocatedQuantity,
      0
    );

    if (remainingQuantity > 0) {
      return `Only ${addedQuantity} out of ${requestedQuantity} units were available. Remaining ${remainingQuantity} could not be added due to stock limits.`;
    }

    return `Added ${requestedQuantity} units to cart based on available stock.`;
  }

  async _getOrCreatePendingOrder(customerId, branchId) {
    let order = await Order.findOne({
      customer_id: customerId,
      branch_id: branchId,
      status: 'pending',
    });

    if (!order) {
      order = await Order.create({
        customer_id: customerId,
        branch_id: branchId,
        total: 0,
        delivery_charges: 0,
        status: 'pending',
        order_items: [],
      });
    }

    return order;
  }

  async _upsertOrderItem(orderId, medicineId, quantityToAdd, unitPrice) {
    let orderItem = await OrderItem.findOne({
      order_id: orderId,
      medicine_id: medicineId,
    });

    if (orderItem) {
      orderItem.quantity += quantityToAdd;
      orderItem.subtotal = this._roundTo2(orderItem.quantity * unitPrice);
      await orderItem.save();
      return orderItem;
    }

    orderItem = await OrderItem.create({
      order_id: orderId,
      medicine_id: medicineId,
      quantity: quantityToAdd,
      subtotal: this._roundTo2(quantityToAdd * unitPrice),
    });

    await Order.findByIdAndUpdate(orderId, {
      $addToSet: { order_items: orderItem._id },
    });

    return orderItem;
  }

  async _getDominantCartBranchId(customerId) {
    const pendingOrders = await Order.find({
      customer_id: customerId,
      status: 'pending',
    })
      .select('_id branch_id')
      .lean();

    if (!pendingOrders.length) {
      return null;
    }

    const pendingOrderIds = pendingOrders.map(order => order._id);
    const pendingOrderItems = await OrderItem.find({
      order_id: { $in: pendingOrderIds },
    })
      .select('order_id quantity')
      .lean();

    if (!pendingOrderItems.length) {
      return null;
    }

    const orderBranchMap = new Map(
      pendingOrders.map(order => [
        order._id.toString(),
        order.branch_id?.toString(),
      ])
    );

    const branchQuantityMap = new Map();
    for (const item of pendingOrderItems) {
      const orderId = item.order_id?.toString();
      const branchId = orderBranchMap.get(orderId);
      if (!branchId) continue;

      const quantity = Number(item.quantity) || 0;
      branchQuantityMap.set(
        branchId,
        (branchQuantityMap.get(branchId) || 0) + quantity
      );
    }

    let dominantBranchId = null;
    let dominantQuantity = -1;
    for (const [branchId, quantity] of branchQuantityMap.entries()) {
      if (quantity > dominantQuantity) {
        dominantQuantity = quantity;
        dominantBranchId = branchId;
      }
    }

    return dominantBranchId;
  }

  _chooseMinimumBranchCombination(
    candidates,
    requestedQuantity,
    dominantBranchId = null
  ) {
    const validCandidates = candidates.filter(
      candidate => candidate.availableQuantity > 0
    );

    if (!validCandidates.length) {
      return null;
    }

    const totalAvailable = validCandidates.reduce(
      (sum, candidate) => sum + candidate.availableQuantity,
      0
    );

    if (totalAvailable < requestedQuantity) {
      return null;
    }

    let bestSet = null;
    const n = validCandidates.length;

    const evaluateSubset = subset => {
      const total = subset.reduce(
        (sum, item) => sum + item.availableQuantity,
        0
      );
      if (total < requestedQuantity) return;

      const rankScore = subset.reduce((sum, item) => sum + item.rank, 0);
      const stockScore = subset.reduce(
        (sum, item) => sum + item.availableQuantity,
        0
      );
      const dominantScore =
        dominantBranchId &&
        subset.some(item => item.branchId === dominantBranchId)
          ? 0
          : 1;

      if (!bestSet) {
        bestSet = { subset, rankScore, stockScore, dominantScore };
        return;
      }

      if (dominantScore < bestSet.dominantScore) {
        bestSet = { subset, rankScore, stockScore, dominantScore };
        return;
      }

      if (
        dominantScore === bestSet.dominantScore &&
        rankScore < bestSet.rankScore
      ) {
        bestSet = { subset, rankScore, stockScore, dominantScore };
        return;
      }

      if (
        dominantScore === bestSet.dominantScore &&
        rankScore === bestSet.rankScore &&
        stockScore > bestSet.stockScore
      ) {
        bestSet = { subset, rankScore, stockScore, dominantScore };
      }
    };

    const maxCombinationalCandidates = 15;
    if (n > maxCombinationalCandidates) {
      const heuristic = validCandidates
        .slice()
        .sort((a, b) => b.availableQuantity - a.availableQuantity);

      let running = 0;
      const picked = [];
      for (const candidate of heuristic) {
        picked.push(candidate);
        running += candidate.availableQuantity;
        if (running >= requestedQuantity) break;
      }

      if (running >= requestedQuantity) {
        return picked.sort((a, b) => a.rank - b.rank);
      }

      return null;
    }

    for (let size = 1; size <= n; size += 1) {
      bestSet = null;

      const backtrack = (startIndex, subset, runningTotal) => {
        if (subset.length === size) {
          if (runningTotal >= requestedQuantity) {
            evaluateSubset(subset.slice());
          }
          return;
        }

        for (let i = startIndex; i < n; i += 1) {
          subset.push(validCandidates[i]);
          backtrack(
            i + 1,
            subset,
            runningTotal + validCandidates[i].availableQuantity
          );
          subset.pop();
        }
      };

      backtrack(0, [], 0);

      if (bestSet?.subset?.length) {
        return bestSet.subset.slice().sort((a, b) => a.rank - b.rank);
      }
    }

    return null;
  }

  async _recalculateOrderTotal(orderId) {
    const items = await OrderItem.find({ order_id: orderId }).select(
      'subtotal'
    );
    const total = items.reduce(
      (sum, item) => sum + (Number(item.subtotal) || 0),
      0
    );

    await Order.findByIdAndUpdate(orderId, {
      total: this._roundTo2(total),
    });

    return this._roundTo2(total);
  }

  _buildEmptyCartResponse() {
    return {
      items: [],
      summary: {
        uniqueItems: 0,
        itemCount: 0,
        subtotal: 0,
        taxRate: this.taxRate,
        taxAmount: 0,
        total: 0,
      },
      checkout: {
        canProceed: false,
        message: 'Your cart is empty',
      },
      message: 'Your cart is empty',
    };
  }

  async _buildCartResponse(customerId) {
    const pendingOrders = await Order.find({
      customer_id: customerId,
      status: 'pending',
    })
      .populate({
        path: 'order_items',
        populate: {
          path: 'medicine_id',
          select:
            'Name alias_name sale_price img_urls is_available prescription_required medicine_category mgs',
        },
      })
      .sort({ created_at: 1 });

    if (!pendingOrders.length) {
      return this._buildEmptyCartResponse();
    }

    const items = [];
    let subtotal = 0;
    let itemCount = 0;

    for (const order of pendingOrders) {
      for (const orderItem of order.order_items || []) {
        const medicine = orderItem.medicine_id;
        if (!medicine) continue;

        const quantity = Number(orderItem.quantity) || 0;
        const itemSubtotal = this._roundTo2(orderItem.subtotal || 0);
        const unitPrice =
          quantity > 0 ? this._roundTo2(itemSubtotal / quantity) : 0;

        subtotal += itemSubtotal;
        itemCount += quantity;

        items.push({
          itemId: orderItem._id,
          orderId: order._id,
          medicineId: medicine._id,
          name: medicine.Name,
          aliasName: medicine.alias_name || null,
          imageUrl: Array.isArray(medicine.img_urls)
            ? medicine.img_urls[0] || null
            : null,
          quantity,
          unitPrice,
          subtotal: itemSubtotal,
          isAvailable: medicine.is_available,
          prescriptionRequired: medicine.prescription_required,
          category: medicine.medicine_category || null,
          dosageForm: medicine.mgs || null,
        });
      }
    }

    if (!items.length) {
      return this._buildEmptyCartResponse();
    }

    const roundedSubtotal = this._roundTo2(subtotal);
    const taxAmount = this._roundTo2(roundedSubtotal * this.taxRate);
    const total = this._roundTo2(roundedSubtotal + taxAmount);

    return {
      items,
      summary: {
        uniqueItems: items.length,
        itemCount,
        subtotal: roundedSubtotal,
        taxRate: this.taxRate,
        taxAmount,
        total,
      },
      checkout: {
        canProceed: items.length > 0,
        message: 'Ready to proceed to checkout',
      },
      message: null,
    };
  }

  async getCart(customerId) {
    return this._buildCartResponse(customerId);
  }

  async getCartCount(customerId) {
    const pendingOrders = await Order.find({
      customer_id: customerId,
      status: 'pending',
    }).select('_id');

    if (!pendingOrders.length) {
      return {
        itemCount: 0,
        uniqueItems: 0,
      };
    }

    const orderIds = pendingOrders.map(order => order._id);
    const items = await OrderItem.find({ order_id: { $in: orderIds } }).select(
      'quantity'
    );

    const itemCount = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );

    return {
      itemCount,
      uniqueItems: items.length,
    };
  }

  async addToCart(customerId, payload) {
    const { medicineId } = payload;
    const requestedQuantity = Number(payload.quantity) || 1;

    const medicine = await Medicine.findById(medicineId).select(
      '_id Name alias_name mgs medicine_category branch_id sale_price is_available'
    );

    if (!medicine || !medicine.is_available) {
      throw new Error('MEDICINE_NOT_AVAILABLE');
    }

    const customer = await Customer.findById(customerId).populate('address_id');
    if (!customer) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    const customerCity = this._normalizeCity(customer.address_id?.city);
    if (!customerCity) {
      throw new Error('CUSTOMER_CITY_NOT_AVAILABLE');
    }

    const equivalentMedicines = await Medicine.find(
      this._buildEquivalentMedicineQuery(medicine)
    ).select('_id branch_id sale_price is_available');

    if (!equivalentMedicines.length) {
      throw new Error('MEDICINE_NOT_AVAILABLE');
    }

    const branchIds = [
      ...new Set(
        equivalentMedicines
          .map(item => item.branch_id?.toString())
          .filter(Boolean)
      ),
    ];

    const branches = await Branch.find({
      _id: { $in: branchIds },
      status: 'Active',
    })
      .populate('address_id')
      .lean();

    if (!branches.length) {
      throw new Error('NO_STOCK_ANY_BRANCH');
    }

    const sameCityBranches = branches.filter(
      branch => this._normalizeCity(branch.address_id?.city) === customerCity
    );

    if (!sameCityBranches.length) {
      throw new Error('NO_STOCK_IN_CUSTOMER_CITY');
    }

    const rankedBranches = customer.address_id
      ? rankBranchesByProximity(customer.address_id, sameCityBranches)
      : sameCityBranches;

    const dominantCartBranchId =
      await this._getDominantCartBranchId(customerId);

    const selectedBranchId = medicine.branch_id?.toString();
    const selectedBranch = rankedBranches.find(
      branch => branch._id?.toString() === selectedBranchId
    );

    const orderedBranches = selectedBranch
      ? [
          selectedBranch,
          ...rankedBranches.filter(
            branch => branch._id?.toString() !== selectedBranchId
          ),
        ]
      : rankedBranches;

    const medicineByBranchId = new Map();
    for (const item of equivalentMedicines) {
      medicineByBranchId.set(item.branch_id?.toString(), item);
    }

    const stockRows = await StockInHand.find({
      medicine_id: { $in: equivalentMedicines.map(item => item._id) },
    })
      .select('medicine_id quantity')
      .lean();

    const stockByMedicineId = new Map();
    for (const row of stockRows) {
      const medicineKey = row.medicine_id?.toString();
      if (!medicineKey) continue;
      stockByMedicineId.set(
        medicineKey,
        Math.max(0, Number(row.quantity) || 0)
      );
    }

    const branchCandidates = orderedBranches
      .map((branch, rank) => {
        const branchId = branch._id?.toString();
        const branchMedicine = medicineByBranchId.get(branchId);
        if (!branchMedicine) return null;

        const availableQuantity =
          stockByMedicineId.get(branchMedicine._id.toString()) || 0;

        return {
          rank,
          branchId,
          branchName: branch.name || 'a nearby branch',
          medicineId: branchMedicine._id,
          unitPrice: Number(branchMedicine.sale_price) || 0,
          availableQuantity,
        };
      })
      .filter(Boolean);

    let remainingQuantity = requestedQuantity;
    const allocations = [];

    const minBranchSet = this._chooseMinimumBranchCombination(
      branchCandidates,
      requestedQuantity,
      dominantCartBranchId
    );

    if (minBranchSet?.length) {
      for (const candidate of minBranchSet) {
        if (remainingQuantity <= 0) break;

        const allocatedQuantity = Math.min(
          remainingQuantity,
          candidate.availableQuantity
        );

        if (allocatedQuantity <= 0) continue;

        allocations.push({
          branchId: candidate.branchId,
          branchName: candidate.branchName,
          medicineId: candidate.medicineId,
          allocatedQuantity,
          unitPrice: candidate.unitPrice,
        });

        remainingQuantity -= allocatedQuantity;
      }
    } else {
      // If full fulfillment is impossible, add maximum possible from nearest branches.
      for (const candidate of branchCandidates) {
        if (remainingQuantity <= 0) break;
        if (candidate.availableQuantity <= 0) continue;

        const allocatedQuantity = Math.min(
          remainingQuantity,
          candidate.availableQuantity
        );

        allocations.push({
          branchId: candidate.branchId,
          branchName: candidate.branchName,
          medicineId: candidate.medicineId,
          allocatedQuantity,
          unitPrice: candidate.unitPrice,
        });

        remainingQuantity -= allocatedQuantity;
      }
    }

    if (!allocations.length) {
      throw new Error('NO_STOCK_ANY_BRANCH');
    }

    const affectedOrderIds = new Set();
    for (const allocation of allocations) {
      const order = await this._getOrCreatePendingOrder(
        customerId,
        allocation.branchId
      );
      await this._upsertOrderItem(
        order._id,
        allocation.medicineId,
        allocation.allocatedQuantity,
        allocation.unitPrice
      );
      affectedOrderIds.add(order._id.toString());
    }

    for (const orderId of affectedOrderIds) {
      await this._recalculateOrderTotal(orderId);
    }

    const cart = await this._buildCartResponse(customerId);
    const allocationMessage = this._getAllocationMessage(
      requestedQuantity,
      allocations,
      remainingQuantity
    );

    return {
      ...cart,
      allocation: {
        requestedQuantity,
        fulfilledQuantity: requestedQuantity - remainingQuantity,
        unfulfilledQuantity: remainingQuantity,
      },
      message: allocationMessage,
    };
  }

  async updateCartItem(customerId, itemId, quantity) {
    const orderItem = await OrderItem.findById(itemId);
    if (!orderItem) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    const order = await Order.findById(orderItem.order_id);
    if (
      !order ||
      String(order.customer_id) !== String(customerId) ||
      order.status !== 'pending'
    ) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    const medicine = await Medicine.findById(orderItem.medicine_id).select(
      'sale_price'
    );
    const unitPrice = medicine ? Number(medicine.sale_price) || 0 : 0;

    orderItem.quantity = quantity;
    orderItem.subtotal = this._roundTo2(unitPrice * quantity);
    await orderItem.save();

    await this._recalculateOrderTotal(order._id);

    return this._buildCartResponse(customerId);
  }

  async removeCartItem(customerId, itemId) {
    const orderItem = await OrderItem.findById(itemId);
    if (!orderItem) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    const order = await Order.findById(orderItem.order_id);
    if (
      !order ||
      String(order.customer_id) !== String(customerId) ||
      order.status !== 'pending'
    ) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    await OrderItem.findByIdAndDelete(itemId);

    order.order_items = (order.order_items || []).filter(
      existingId => String(existingId) !== String(itemId)
    );
    await order.save();

    const remainingItems = await OrderItem.countDocuments({
      order_id: order._id,
    });
    if (!remainingItems) {
      await Order.findByIdAndDelete(order._id);
    } else {
      await this._recalculateOrderTotal(order._id);
    }

    return this._buildCartResponse(customerId);
  }

  async clearCart(customerId) {
    const pendingOrders = await Order.find({
      customer_id: customerId,
      status: 'pending',
    }).select('_id');

    if (!pendingOrders.length) {
      return this._buildEmptyCartResponse();
    }

    const orderIds = pendingOrders.map(order => order._id);
    await OrderItem.deleteMany({ order_id: { $in: orderIds } });
    await Order.deleteMany({ _id: { $in: orderIds } });

    return this._buildEmptyCartResponse();
  }
}

export default new CustomerCartService();
