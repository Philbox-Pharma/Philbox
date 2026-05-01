import Cart from '../../../../../models/Cart.js';
import CartItem from '../../../../../models/CartItem.js';
import Medicine from '../../../../../models/Medicine.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Branch from '../../../../../models/Branch.js';
import Customer from '../../../../../models/Customer.js';
import { rankBranchesByProximityAsync } from '../../../../../utils/proximityCalculator.js';

class CustomerCartService {
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
      active: true,
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

    if (medicine.category) {
      query.category = medicine.category;
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

  async _getOrCreateCart(customerId) {
    let cart = await Cart.findOne({ customer_id: customerId });

    if (!cart) {
      cart = await Cart.create({
        customer_id: customerId,
        total: 0,
        items: [],
      });
    }

    return cart;
  }

  async _upsertCartItem(cartId, branchId, medicineId, quantityToAdd, price) {
    let cartItem = await CartItem.findOne({
      cart_id: cartId,
      branch_id: branchId,
      medicine_id: medicineId,
    });

    if (cartItem) {
      cartItem.quantity += quantityToAdd;
      cartItem.price = this._roundTo2(Number(price) || 0);
      cartItem.subtotal = this._roundTo2(cartItem.quantity * cartItem.price);
      await cartItem.save();
      return cartItem;
    }

    cartItem = await CartItem.create({
      cart_id: cartId,
      branch_id: branchId,
      medicine_id: medicineId,
      quantity: quantityToAdd,
      price: this._roundTo2(Number(price) || 0),
      subtotal: this._roundTo2(quantityToAdd * price),
    });

    await Cart.findByIdAndUpdate(cartId, {
      $addToSet: { items: cartItem._id },
    });

    return cartItem;
  }

  async _getDominantCartBranchId(customerId) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id')
      .lean();

    if (!cart) {
      return null;
    }

    const cartItems = await CartItem.find({
      cart_id: cart._id,
    })
      .select('branch_id quantity')
      .lean();

    if (!cartItems.length) {
      return null;
    }

    const branchQuantityMap = new Map();
    for (const item of cartItems) {
      const branchId = item.branch_id?.toString();
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

  async _buildMedicineAllocationPlan(
    customerId,
    medicineId,
    requestedQuantity
  ) {
    const medicine = await Medicine.findById(medicineId).select(
      '_id Name alias_name mgs dosage_form category sale_price active'
    );

    if (!medicine || !medicine.active) {
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
    ).select('_id sale_price active');

    if (!equivalentMedicines.length) {
      throw new Error('MEDICINE_NOT_AVAILABLE');
    }

    const branchIds = [
      ...new Set(
        (
          await StockInHand.find({
            medicine_id: {
              $in: equivalentMedicines.map(item => item._id),
            },
            quantity: { $gt: 0 },
          })
            .select('branch_id')
            .lean()
        )
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
      ? await rankBranchesByProximityAsync(
          customer.address_id,
          sameCityBranches
        )
      : sameCityBranches;

    const dominantCartBranchId =
      await this._getDominantCartBranchId(customerId);
    const orderedBranches = rankedBranches;

    const medicineById = new Map(
      equivalentMedicines.map(item => [item._id?.toString(), item])
    );

    const stockRows = await StockInHand.find({
      medicine_id: { $in: equivalentMedicines.map(item => item._id) },
    })
      .select('medicine_id branch_id quantity')
      .lean();

    const stockByBranch = new Map();
    for (const row of stockRows) {
      const medicineKey = row.medicine_id?.toString();
      const branchKey = row.branch_id?.toString();
      if (!medicineKey || !branchKey) continue;

      const medicineDoc = medicineById.get(medicineKey);
      if (!medicineDoc) continue;

      const quantity = Math.max(0, Number(row.quantity) || 0);
      const current = stockByBranch.get(branchKey);

      if (!current || quantity > current.availableQuantity) {
        stockByBranch.set(branchKey, {
          medicineId: row.medicine_id,
          availableQuantity: quantity,
          price: Number(medicineDoc.sale_price) || 0,
        });
      }
    }

    const branchCandidates = orderedBranches
      .map((branch, rank) => {
        const branchId = branch._id?.toString();
        const branchStock = stockByBranch.get(branchId);
        if (!branchStock) return null;

        return {
          rank,
          branchId,
          branchName: branch.name || 'a nearby branch',
          medicineId: branchStock.medicineId,
          price: branchStock.price,
          availableQuantity: branchStock.availableQuantity,
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
          price: candidate.price,
        });

        remainingQuantity -= allocatedQuantity;
      }
    } else {
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
          price: candidate.price,
        });

        remainingQuantity -= allocatedQuantity;
      }
    }

    if (!allocations.length) {
      throw new Error('NO_STOCK_ANY_BRANCH');
    }

    const cartDoc = await this._getOrCreateCart(customerId);
    for (const allocation of allocations) {
      await this._upsertCartItem(
        cartDoc._id,
        allocation.branchId,
        allocation.medicineId,
        allocation.allocatedQuantity,
        allocation.price
      );
    }

    await this._recalculateCartTotal(cartDoc._id);

    const cart = await this._buildCartResponse(customerId);
    const allocationMessage = this._getAllocationMessage(
      requestedQuantity,
      allocations,
      remainingQuantity
    );

    return {
      allocation: {
        requestedQuantity,
        fulfilledQuantity: requestedQuantity - remainingQuantity,
        unfulfilledQuantity: remainingQuantity,
      },
      cart,
      allocations,
      requestedQuantity,
      message: allocationMessage,
    };
  }

  async _allocateMedicineToCart(customerId, medicineId, requestedQuantity) {
    const plan = await this._buildMedicineAllocationPlan(
      customerId,
      medicineId,
      requestedQuantity
    );

    const cartDoc = await this._getOrCreateCart(customerId);
    for (const allocation of plan.allocations) {
      await this._upsertCartItem(
        cartDoc._id,
        allocation.branchId,
        allocation.medicineId,
        allocation.allocatedQuantity,
        allocation.price
      );
    }

    await this._recalculateCartTotal(cartDoc._id);

    const cart = await this._buildCartResponse(customerId);

    return {
      ...cart,
      allocation: plan.allocation,
      message: plan.message,
    };
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

  async _recalculateCartTotal(cartId) {
    const items = await CartItem.find({ cart_id: cartId }).select('subtotal');
    const total = items.reduce(
      (sum, item) => sum + (Number(item.subtotal) || 0),
      0
    );

    await Cart.findByIdAndUpdate(cartId, {
      total: this._roundTo2(total),
    });

    return this._roundTo2(total);
  }

  _buildEmptyCartResponse(cart = null) {
    return {
      cart: cart
        ? {
            ...cart,
            total: 0,
            items: [],
          }
        : null,
      message: 'Your cart is empty',
    };
  }

  async _buildCartResponse(customerId) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id customer_id total created_at updated_at')
      .lean();

    if (!cart) {
      return this._buildEmptyCartResponse();
    }

    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate('branch_id', 'name')
      .populate({
        path: 'medicine_id',
        select:
          'Name alias_name sale_price img_urls active prescription_required category mgs dosage_form',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .lean()
      .sort({ created_at: 1 });

    if (!cartItems.length) {
      return this._buildEmptyCartResponse(cart);
    }

    const normalizedItems = cartItems
      .filter(item => item.medicine_id)
      .map(item => ({
        itemId: item._id,
        branchId: item.branch_id?._id || item.branch_id || null,
        branchName: item.branch_id?.name || null,
        medicineId: item.medicine_id._id,
        name: item.medicine_id.Name,
        aliasName: item.medicine_id.alias_name || null,
        imageUrls: Array.isArray(item.medicine_id.img_urls)
          ? item.medicine_id.img_urls
          : [],
        quantity: Number(item.quantity) || 0,
        price: this._roundTo2(
          Number(item.price ?? item.medicine_id?.sale_price) || 0
        ),
        subtotal: this._roundTo2(Number(item.subtotal) || 0),
        isAvailable: Boolean(item.medicine_id.active),
        prescriptionRequired: Boolean(item.medicine_id.prescription_required),
      }));

    if (!normalizedItems.length) {
      return this._buildEmptyCartResponse(cart);
    }

    const subtotal = this._roundTo2(
      normalizedItems.reduce(
        (sum, item) => sum + (Number(item.subtotal) || 0),
        0
      )
    );

    return {
      cart: {
        ...cart,
        total: subtotal,
        items: normalizedItems,
      },
    };
  }

  async getCart(customerId) {
    return this._buildCartResponse(customerId);
  }

  async getCartCount(customerId) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id')
      .lean();

    if (!cart) {
      return {
        itemCount: 0,
        uniqueItems: 0,
      };
    }

    const items = await CartItem.find({ cart_id: cart._id }).select('quantity');

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
    const requestedQuantity = Number(payload.quantity) || 1;
    return this._allocateMedicineToCart(
      customerId,
      payload.medicineId,
      requestedQuantity
    );
  }

  async updateCartItem(customerId, itemId, quantity) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id')
      .lean();
    if (!cart) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    const cartItem = await CartItem.findOne({
      _id: itemId,
      cart_id: cart._id,
    });
    if (!cartItem) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    const requestedQuantity = Number(quantity) || 0;
    const plan = await this._buildMedicineAllocationPlan(
      customerId,
      cartItem.medicine_id,
      requestedQuantity
    );

    if (plan.allocation.unfulfilledQuantity > 0) {
      return {
        stockCheckFailed: true,
        requestedQuantity,
        maxAvailableQuantity: plan.allocation.fulfilledQuantity,
        message: `Only ${plan.allocation.fulfilledQuantity} out of ${requestedQuantity} units are available. No changes were made to your cart.`,
      };
    }

    const sameMedicineItems = await CartItem.find({
      cart_id: cart._id,
      medicine_id: cartItem.medicine_id,
    })
      .select('_id')
      .lean();

    await CartItem.deleteMany({
      cart_id: cart._id,
      medicine_id: cartItem.medicine_id,
    });

    if (sameMedicineItems.length) {
      await Cart.findByIdAndUpdate(cart._id, {
        $pull: { items: { $in: sameMedicineItems.map(item => item._id) } },
      });
    }

    for (const allocation of plan.allocations) {
      await this._upsertCartItem(
        cart._id,
        allocation.branchId,
        allocation.medicineId,
        allocation.allocatedQuantity,
        allocation.price
      );
    }

    await this._recalculateCartTotal(cart._id);

    const cartWithUpdatedAllocation = await this._buildCartResponse(customerId);

    return cartWithUpdatedAllocation;
  }

  async removeCartItem(customerId, itemId) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id items')
      .lean();
    if (!cart) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    const cartItem = await CartItem.findOne({
      _id: itemId,
      cart_id: cart._id,
    });
    if (!cartItem) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    await CartItem.findByIdAndDelete(itemId);

    await Cart.findByIdAndUpdate(cart._id, {
      $pull: { items: cartItem._id },
    });

    const remainingItems = await CartItem.countDocuments({
      cart_id: cart._id,
    });
    if (!remainingItems) {
      await Cart.findByIdAndUpdate(cart._id, {
        total: 0,
        items: [],
      });
    } else {
      await this._recalculateCartTotal(cart._id);
    }

    return this._buildCartResponse(customerId);
  }

  async clearCart(customerId) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id')
      .lean();

    if (!cart) {
      return this._buildEmptyCartResponse();
    }

    await CartItem.deleteMany({ cart_id: cart._id });
    await Cart.findByIdAndUpdate(cart._id, {
      total: 0,
      items: [],
    });

    return this._buildEmptyCartResponse();
  }
}

export default new CustomerCartService();
