import Medicine from '../../../../../models/Medicine.js';
import Branch from '../../../../../models/Branch.js';
import Customer from '../../../../../models/Customer.js';
import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import { rankBranchesByProximity } from '../../../../../utils/proximityCalculator.js';

class MedicineCatalogService {
  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _buildCategoryDosageClause(categoryFilter = null, dosageFilter = null) {
    const rawValues = [categoryFilter, dosageFilter]
      .filter(value => typeof value === 'string')
      .map(value => value.trim())
      .filter(Boolean);

    if (!rawValues.length) {
      return null;
    }

    const uniqueValues = [...new Set(rawValues)];
    const orConditions = [];

    for (const value of uniqueValues) {
      const escaped = this._escapeRegex(value);
      orConditions.push(
        { medicine_category: { $regex: escaped, $options: 'i' } },
        { mgs: { $regex: escaped, $options: 'i' } }
      );
    }

    return { $or: orConditions };
  }

  /**
   * Browse medicines with cart-first branch ranking and proximity fallback
   *
   * Flow:
   * 1) If customer has pending cart items, branch with highest cart medicine quantity is prioritized.
   * 2) Remaining branches are ranked by proximity to customer address.
   * 3) If no cart data exists, full ordering is purely proximity-based.
   */
  async browseMedicines(customerId, filters = {}) {
    const {
      categoryFilter = null,
      brandFilter = null,
      dosageFilter = null,
      prescriptionStatusFilter = null,
      sortBy = 'name',
      page = 1,
      limit = 20,
    } = filters;

    // Get customer data with address
    const customer = await Customer.findById(customerId).populate('address_id');

    if (!customer) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    const ranking = await this._getOrderedBranches(customer);
    const branches = ranking.orderedBranches;

    if (!branches.length) {
      throw new Error('NO_BRANCHES_AVAILABLE');
    }

    const branchIds = branches.map(b => b._id);
    const branchIndexMap = new Map(
      branchIds.map((id, index) => [id.toString(), index])
    );

    const query = {
      branch_id: { $in: branchIds },
      is_available: true,
    };

    const categoryDosageClause = this._buildCategoryDosageClause(
      categoryFilter,
      dosageFilter
    );

    if (categoryDosageClause) {
      query.$and = [categoryDosageClause];
    }

    if (prescriptionStatusFilter) {
      // Intentionally not applied at DB level because current Medicine schema
      // has no dedicated prescription status field.
    }

    if (brandFilter) {
      const brandClause = {
        $or: [
          { Name: { $regex: brandFilter, $options: 'i' } },
          { alias_name: { $regex: brandFilter, $options: 'i' } },
        ],
      };

      if (query.$and) {
        query.$and.push(brandClause);
      } else {
        query.$and = [brandClause];
      }
    }

    const allMatchedMedicines = await Medicine.find(query)
      .populate('class', 'name')
      .lean();

    const sortedMedicines = allMatchedMedicines
      .slice()
      .sort((a, b) => {
        const branchRankA = branchIndexMap.get(a.branch_id?.toString()) ?? 9999;
        const branchRankB = branchIndexMap.get(b.branch_id?.toString()) ?? 9999;

        if (branchRankA !== branchRankB) {
          return branchRankA - branchRankB;
        }

        if (sortBy === 'price_low_to_high') {
          return (a.sale_price || 0) - (b.sale_price || 0);
        }

        if (sortBy === 'price_high_to_low') {
          return (b.sale_price || 0) - (a.sale_price || 0);
        }

        return (a.Name || '').localeCompare(b.Name || '');
      })
      .map(medicine => this._sanitizeMedicineForCustomer(medicine));

    const totalMedicines = sortedMedicines.length;
    const skip = (page - 1) * limit;
    const medicines = sortedMedicines.slice(skip, skip + limit);

    const totalPages = Math.ceil(totalMedicines / limit);

    return {
      success: true,
      data: {
        medicines,
        pagination: {
          currentPage: page,
          totalPages,
          totalMedicines,
          itemsPerPage: limit,
        },
        appliedFilters: {
          category: categoryFilter,
          brand: brandFilter,
          dosage: dosageFilter,
          prescriptionStatus: prescriptionStatusFilter,
          sortBy,
        },
      },
    };
  }

  /**
   * Helper function to get proximity info for a specific branch
   */
  _getBranchProximity(branchId, rankedBranches) {
    const branch = rankedBranches.find(
      b => b._id.toString() === branchId.toString()
    );

    if (!branch) {
      return null;
    }

    return {
      proximityScore: branch.proximityScore,
      proximityMethod: branch.proximityMethod,
      distanceInfo:
        branch.proximityMethod === 'haversine'
          ? `${branch.proximityScore.toFixed(2)} km away`
          : branch.proximityMethod === 'location_hierarchy'
            ? `In ${branch.address_id?.city || 'nearby area'}`
            : 'Proximity ranking applied',
    };
  }

  _buildMedicineIdentityKey(medicine) {
    const name = (medicine?.Name || '').trim().toLowerCase();
    const alias = (medicine?.alias_name || '').trim().toLowerCase();
    const dosage = (medicine?.mgs || '').trim().toLowerCase();
    const category = (medicine?.medicine_category || '').trim().toLowerCase();
    return `${name}|${alias}|${dosage}|${category}`;
  }

  _sanitizeMedicineForCustomer(medicine) {
    if (!medicine) return medicine;

    const medicineClass = medicine.class
      ? typeof medicine.class === 'object'
        ? {
            _id: medicine.class._id,
            name: medicine.class.name,
          }
        : medicine.class
      : null;

    return {
      _id: medicine._id,
      Name: medicine.Name,
      description: medicine.description,
      sale_price: medicine.sale_price,
      purchase_price: medicine.purchase_price,
      is_available: medicine.is_available,
      class: medicineClass,
    };
  }

  async _getDominantCartBranchId(customerId) {
    // No dedicated cart schema exists; treat pending orders as active cart state.
    const pendingOrders = await Order.find({
      customer_id: customerId,
      status: 'pending',
    })
      .select('_id')
      .lean();

    if (!pendingOrders.length) {
      return null;
    }

    const pendingOrderIds = pendingOrders.map(order => order._id);
    const pendingOrderItems = await OrderItem.find({
      order_id: { $in: pendingOrderIds },
    })
      .select('medicine_id quantity')
      .lean();

    if (!pendingOrderItems.length) {
      return null;
    }

    const medicineIds = [
      ...new Set(
        pendingOrderItems
          .map(item => item.medicine_id?.toString())
          .filter(Boolean)
      ),
    ];

    if (!medicineIds.length) {
      return null;
    }

    const cartMedicines = await Medicine.find({ _id: { $in: medicineIds } })
      .select('_id branch_id')
      .lean();

    const medicineToBranchMap = new Map(
      cartMedicines.map(med => [med._id.toString(), med.branch_id?.toString()])
    );

    const branchQuantityMap = new Map();
    for (const item of pendingOrderItems) {
      const branchId = medicineToBranchMap.get(item.medicine_id?.toString());
      if (!branchId) continue;

      const qty = Number(item.quantity) || 1;
      branchQuantityMap.set(
        branchId,
        (branchQuantityMap.get(branchId) || 0) + qty
      );
    }

    let dominantBranchId = null;
    let maxQuantity = -1;
    for (const [branchId, quantity] of branchQuantityMap.entries()) {
      if (quantity > maxQuantity) {
        maxQuantity = quantity;
        dominantBranchId = branchId;
      }
    }

    return dominantBranchId;
  }

  async _getOrderedBranches(customer) {
    const allBranches = await Branch.find({ status: 'Active' }).populate(
      'address_id'
    );

    if (!allBranches.length) {
      return {
        orderedBranches: [],
        prioritizedBranchId: null,
        rankingMode: 'none',
      };
    }

    const dominantCartBranchId = await this._getDominantCartBranchId(
      customer._id
    );

    const proximityRankedBranches = customer.address_id
      ? rankBranchesByProximity(customer.address_id, allBranches)
      : allBranches;

    if (!dominantCartBranchId) {
      return {
        orderedBranches: proximityRankedBranches,
        prioritizedBranchId: null,
        rankingMode: customer.address_id
          ? 'proximity_only'
          : 'no_address_no_cart',
      };
    }

    const prioritizedBranch = proximityRankedBranches.find(
      branch => branch._id.toString() === dominantCartBranchId
    );

    if (!prioritizedBranch) {
      return {
        orderedBranches: proximityRankedBranches,
        prioritizedBranchId: null,
        rankingMode: customer.address_id
          ? 'proximity_only'
          : 'no_address_no_cart',
      };
    }

    const remainingBranches = proximityRankedBranches.filter(
      branch => branch._id.toString() !== dominantCartBranchId
    );

    return {
      orderedBranches: [prioritizedBranch, ...remainingBranches],
      prioritizedBranchId: dominantCartBranchId,
      rankingMode: customer.address_id
        ? 'cart_priority_then_proximity'
        : 'cart_priority_no_address',
    };
  }

  async searchMedicines(customerId, options = {}) {
    const {
      searchTerm,
      categoryFilter = null,
      dosageFilter = null,
      sortBy = 'name',
      page = 1,
      limit = 10,
    } = options;

    const customer = await Customer.findById(customerId).populate('address_id');
    if (!customer) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    const ranking = await this._getOrderedBranches(customer);
    const branches = ranking.orderedBranches;

    if (!branches.length) {
      throw new Error('NO_BRANCHES_AVAILABLE');
    }

    const branchIds = branches.map(b => b._id);
    const branchIndexMap = new Map(
      branchIds.map((id, index) => [id.toString(), index])
    );

    const query = {
      branch_id: { $in: branchIds },
      is_available: true,
      $and: [
        {
          $or: [
            { Name: { $regex: searchTerm, $options: 'i' } },
            { alias_name: { $regex: searchTerm, $options: 'i' } },
            { medicine_category: { $regex: searchTerm, $options: 'i' } },
            { mgs: { $regex: searchTerm, $options: 'i' } },
          ],
        },
      ],
    };

    const categoryDosageClause = this._buildCategoryDosageClause(
      categoryFilter,
      dosageFilter
    );

    if (categoryDosageClause) {
      query.$and.push(categoryDosageClause);
    }

    const allMatches = await Medicine.find(query)
      .populate('class', 'name')
      .lean();

    const sortedByBranchRank = allMatches.slice().sort((a, b) => {
      const branchRankA = branchIndexMap.get(a.branch_id?.toString()) ?? 9999;
      const branchRankB = branchIndexMap.get(b.branch_id?.toString()) ?? 9999;

      if (branchRankA !== branchRankB) {
        return branchRankA - branchRankB;
      }

      if (sortBy === 'price_low_to_high') {
        return (a.sale_price || 0) - (b.sale_price || 0);
      }

      if (sortBy === 'price_high_to_low') {
        return (b.sale_price || 0) - (a.sale_price || 0);
      }

      return (a.Name || '').localeCompare(b.Name || '');
    });

    // Deduplicate across branches: keep first occurrence from nearest-ranked branch.
    const seen = new Set();
    const deduped = [];
    for (const medicine of sortedByBranchRank) {
      const key = this._buildMedicineIdentityKey(medicine);
      if (seen.has(key)) continue;

      seen.add(key);
      deduped.push(this._sanitizeMedicineForCustomer(medicine));
    }

    const totalMedicines = deduped.length;
    const totalPages = Math.ceil(totalMedicines / limit);
    const skip = (page - 1) * limit;
    const medicines = deduped.slice(skip, skip + limit);

    return {
      success: true,
      data: {
        medicines,
        count: medicines.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalMedicines,
          itemsPerPage: limit,
        },
      },
    };
  }

  /**
   * Get available branches for the customer
   * Returns branches ranked by proximity if no branch is selected
   */
  async getAvailableBranches(customerId) {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    throw new Error('BRANCH_DETAILS_RESTRICTED');
  }

  /**
   * Get medicine details with branch info and availability
   */
  async getMedicineDetails(medicineId, customerId) {
    const medicine = await Medicine.findById(medicineId).populate(
      'class',
      'name'
    );

    if (!medicine) {
      throw new Error('MEDICINE_NOT_FOUND');
    }

    const customer = await Customer.findById(customerId).populate('address_id');

    if (!customer) {
      throw new Error('CUSTOMER_NOT_FOUND');
    }

    return {
      success: true,
      data: {
        medicine: this._sanitizeMedicineForCustomer(medicine.toObject()),
        availability: {
          inStock: medicine.is_available,
          stockStatus: medicine.is_available ? 'In Stock' : 'Out of Stock',
        },
      },
    };
  }
}

export default new MedicineCatalogService();
