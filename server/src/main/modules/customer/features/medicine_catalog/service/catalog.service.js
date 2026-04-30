import Medicine from '../../../../../models/Medicine.js';
import Manufacturer from '../../../../../models/Manufacturer.js';
import MedicineCategory from '../../../../../models/MedicineCategory.js';
import ItemClass from '../../../../../models/ItemClass.js';
import StockInHand from '../../../../../models/StockInHand.js';
import Branch from '../../../../../models/Branch.js';
import Customer from '../../../../../models/Customer.js';
import Order from '../../../../../models/Order.js';
import OrderItem from '../../../../../models/OrderItem.js';
import SearchHistory from '../../../../../models/SearchHistory.js';
import Cart from '../../../../../models/Cart.js';
import CartItem from '../../../../../models/CartItem.js';
import { rankBranchesByProximityAsync } from '../../../../../utils/proximityCalculator.js';

class MedicineCatalogService {
  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _normalizeText(value = '') {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  _buildRecommendationMedicineKey(medicine) {
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

  _matchesBranchFilter(branch, branchFilter) {
    const value = String(branchFilter || '').trim();
    if (!value) return true;

    const byName = new RegExp(this._escapeRegex(value), 'i').test(
      String(branch?.name || '')
    );

    return byName;
  }

  _normalizeCity(value = '') {
    return String(value || '')
      .trim()
      .toLowerCase();
  }

  _isSameCity(customerAddress, branchAddress) {
    const customerCity = this._normalizeCity(customerAddress?.city);
    const branchCity = this._normalizeCity(branchAddress?.city);

    if (!customerCity || !branchCity) {
      return false;
    }

    return customerCity === branchCity;
  }

  _isNoBrowseFilterApplied(filters = {}) {
    return [
      filters?.categoryFilter,
      filters?.brandFilter,
      filters?.branchFilter,
      filters?.dosageFilter,
      filters?.prescriptionStatusFilter,
    ].every(value => !String(value || '').trim());
  }

  async _buildCategoryClause(categoryFilter = null) {
    const value = String(categoryFilter || '').trim();
    if (!value) return null;

    const escaped = this._escapeRegex(value);
    const categories = await MedicineCategory.find({
      name: { $regex: escaped, $options: 'i' },
    })
      .select('_id')
      .lean();

    const categoryIds = categories.map(item => item._id);
    const orConditions = [];

    if (categoryIds.length) {
      orConditions.push({ category: { $in: categoryIds } });
    }

    if (!orConditions.length) {
      return { _id: null };
    }

    return { $or: orConditions };
  }

  _buildDosageClause(dosageFilter = null) {
    const value = String(dosageFilter || '').trim();
    if (!value) return null;

    const escaped = this._escapeRegex(value);
    return {
      $or: [
        { mgs: { $regex: escaped, $options: 'i' } },
        { dosage_form: { $regex: escaped, $options: 'i' } },
      ],
    };
  }

  _parsePrescriptionRequiredFilter(prescriptionStatusFilter = null) {
    const normalized = String(prescriptionStatusFilter || '')
      .trim()
      .toLowerCase();

    if (!normalized) return null;

    if (
      normalized === 'prescription_required' ||
      normalized === 'prescription' ||
      normalized === 'required' ||
      normalized === 'true' ||
      normalized === 'yes'
    ) {
      return true;
    }

    if (
      normalized === 'otc' ||
      normalized === 'not_required' ||
      normalized === 'false' ||
      normalized === 'no'
    ) {
      return false;
    }

    return null;
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
      branchFilter = null,
      dosageFilter = null,
      prescriptionStatusFilter = null,
      sortBy = 'name',
      page = 1,
      limit = 20,
    } = filters;

    const customer = customerId
      ? await Customer.findById(customerId).populate('address_id')
      : null;

    const ranking = customer
      ? await this._getOrderedBranches(customer)
      : await this._getPublicOrderedBranches();
    let branches = ranking.orderedBranches.filter(branch =>
      this._matchesBranchFilter(branch, branchFilter)
    );

    if (
      customer &&
      this._isNoBrowseFilterApplied(filters) &&
      customer.address_id?.city
    ) {
      const sameCityBranches = branches.filter(branch =>
        this._isSameCity(customer.address_id, branch.address_id)
      );

      // Keep existing behavior when city metadata is incomplete.
      if (sameCityBranches.length) {
        branches = sameCityBranches;
      }
    }

    if (!branches.length) {
      throw new Error('NO_BRANCHES_AVAILABLE');
    }

    const branchIds = branches.map(b => b._id);
    const branchIndexMap = new Map(
      branchIds.map((id, index) => [id.toString(), index])
    );

    const query = {
      active: true,
    };

    const stockRows = await StockInHand.find({
      branch_id: { $in: branchIds },
      quantity: { $gt: 0 },
    })
      .select('medicine_id branch_id')
      .lean();

    const rankedMedicineIds = new Set();
    const medicineRankMap = new Map();
    for (const row of stockRows) {
      const medicineId = row.medicine_id?.toString();
      const branchId = row.branch_id?.toString();
      if (!medicineId || !branchId) continue;

      const rank = branchIndexMap.get(branchId) ?? 9999;
      rankedMedicineIds.add(medicineId);

      const existing = medicineRankMap.get(medicineId);
      if (existing == null || rank < existing) {
        medicineRankMap.set(medicineId, rank);
      }
    }

    if (!rankedMedicineIds.size) {
      return {
        success: true,
        data: {
          medicines: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalMedicines: 0,
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

    query._id = { $in: [...rankedMedicineIds] };

    const andClauses = [];

    const categoryClause = await this._buildCategoryClause(categoryFilter);
    if (categoryClause) {
      andClauses.push(categoryClause);
    }

    const dosageClause = this._buildDosageClause(dosageFilter);
    if (dosageClause) {
      andClauses.push(dosageClause);
    }

    const prescriptionRequired = this._parsePrescriptionRequiredFilter(
      prescriptionStatusFilter
    );
    if (typeof prescriptionRequired === 'boolean') {
      query.prescription_required = prescriptionRequired;
    }

    if (andClauses.length) {
      query.$and = andClauses;
    }

    if (brandFilter) {
      const manufacturers = await Manufacturer.find({
        name: { $regex: this._escapeRegex(brandFilter), $options: 'i' },
      })
        .select('_id')
        .lean();

      const manufacturerIds = manufacturers.map(item => item._id);

      if (!manufacturerIds.length) {
        return {
          success: true,
          data: {
            medicines: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalMedicines: 0,
              itemsPerPage: limit,
            },
            appliedFilters: {
              category: categoryFilter,
              brand: brandFilter,
              branch: branchFilter,
              dosage: dosageFilter,
              prescriptionStatus: prescriptionStatusFilter,
              sortBy,
            },
          },
        };
      }

      query.manufacturer = { $in: manufacturerIds };
    }

    const allMatchedMedicines = await Medicine.find(query)
      .populate('class', 'name')
      .lean();

    const sortedMedicines = allMatchedMedicines
      .slice()
      .sort((a, b) => {
        const branchRankA = medicineRankMap.get(a._id.toString()) ?? 9999;
        const branchRankB = medicineRankMap.get(b._id.toString()) ?? 9999;

        if (branchRankA !== branchRankB) {
          return branchRankA - branchRankB;
        }

        if (sortBy === 'price_low_to_high') {
          return (a.sale_price || 0) - (b.sale_price || 0);
        }

        if (sortBy === 'price_high_to_low') {
          return (b.sale_price || 0) - (a.sale_price || 0);
        }

        if (sortBy === 'popularity') {
          return (b.quantity_sold || 0) - (a.quantity_sold || 0);
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
          branch: branchFilter,
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
    const category = String(medicine?.category?.name || '')
      .trim()
      .toLowerCase();
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
      alias_name: medicine.alias_name || null,
      description: medicine.description,
      img_urls: Array.isArray(medicine.img_urls) ? medicine.img_urls : [],
      sale_price: medicine.sale_price,
      revenue_generated: Number(medicine.revenue_generated || 0),
      refunds_count: Number(medicine.refunds_count || 0),
      purchase_price: medicine.purchase_price,
      unit_price: medicine.unit_price,
      quantity_sold: Number(medicine.quantity_sold || 0),
      mgs: medicine.mgs || null,
      dosage_form: medicine.dosage_form || null,
      is_available: medicine.active,
      active: medicine.active,
      class: medicineClass,
      manufacturer: medicine.manufacturer || null,
      category: medicine.category || null,
      prescription_required: Boolean(medicine.prescription_required),
    };
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
      const key = this._buildRecommendationMedicineKey(medicine);
      if (excludedKeys.has(key)) continue;
      excludedKeys.add(key);
      fallback.push(this._sanitizeMedicineForCustomer(medicine));
      if (fallback.length >= limit) break;
    }

    return fallback;
  }

  _buildRelatedMedicineQuery(baseMedicine) {
    const orConditions = [];

    if (baseMedicine.class) {
      orConditions.push({ class: baseMedicine.class });
    }

    if (baseMedicine.category?._id) {
      orConditions.push({ category: baseMedicine.category._id });
    }

    if (baseMedicine.mgs) {
      orConditions.push({
        mgs: {
          $regex: `^${this._escapeRegex(baseMedicine.mgs)}$`,
          $options: 'i',
        },
      });
    }

    if (!orConditions.length) {
      return null;
    }

    return {
      _id: { $ne: baseMedicine._id },
      active: true,
      $or: orConditions,
    };
  }

  async _getDominantCartBranchId(customerId) {
    const cart = await Cart.findOne({ customer_id: customerId })
      .select('_id')
      .lean();

    if (!cart) {
      return null;
    }

    const cartItems = await CartItem.find({ cart_id: cart._id })
      .select('branch_id quantity')
      .lean();

    if (!cartItems.length) {
      return null;
    }

    const branchQuantityMap = new Map();
    for (const item of cartItems) {
      const branchId = item.branch_id?.toString();
      if (!branchId) continue;

      const quantity = Math.max(0, Number(item.quantity) || 0);
      if (!quantity) continue;

      branchQuantityMap.set(
        branchId,
        (branchQuantityMap.get(branchId) || 0) + quantity
      );
    }

    if (!branchQuantityMap.size) {
      return null;
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
      ? await rankBranchesByProximityAsync(customer.address_id, allBranches)
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

  async _getPublicOrderedBranches() {
    const allBranches = await Branch.find({ status: 'Active' }).populate(
      'address_id'
    );

    return {
      orderedBranches: allBranches,
      prioritizedBranchId: null,
      rankingMode: 'public',
    };
  }

  async searchMedicines(customerId, options = {}) {
    const {
      searchTerm,
      brandFilter = null,
      branchFilter = null,
      categoryFilter = null,
      dosageFilter = null,
      prescriptionStatusFilter = null,
      sortBy = 'name',
      page = 1,
      limit = 10,
    } = options;

    const customer = customerId
      ? await Customer.findById(customerId).populate('address_id')
      : null;

    const ranking = customer
      ? await this._getOrderedBranches(customer)
      : await this._getPublicOrderedBranches();
    const branches = ranking.orderedBranches.filter(branch =>
      this._matchesBranchFilter(branch, branchFilter)
    );

    if (!branches.length) {
      throw new Error('NO_BRANCHES_AVAILABLE');
    }

    const branchIds = branches.map(b => b._id);
    const branchIndexMap = new Map(
      branchIds.map((id, index) => [id.toString(), index])
    );

    const query = {
      active: true,
      $and: [
        {
          $or: [
            { Name: { $regex: searchTerm, $options: 'i' } },
            { alias_name: { $regex: searchTerm, $options: 'i' } },
            { mgs: { $regex: searchTerm, $options: 'i' } },
            { dosage_form: { $regex: searchTerm, $options: 'i' } },
          ],
        },
      ],
    };

    const searchMatchedCategories = await MedicineCategory.find({
      name: { $regex: this._escapeRegex(searchTerm), $options: 'i' },
    })
      .select('_id')
      .lean();

    if (searchMatchedCategories.length) {
      query.$and[0].$or.push({
        category: { $in: searchMatchedCategories.map(item => item._id) },
      });
    }

    if (brandFilter) {
      const manufacturers = await Manufacturer.find({
        name: { $regex: this._escapeRegex(brandFilter), $options: 'i' },
      })
        .select('_id')
        .lean();

      const manufacturerIds = manufacturers.map(item => item._id);
      if (!manufacturerIds.length) {
        return {
          success: true,
          data: {
            medicines: [],
            count: 0,
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalMedicines: 0,
              itemsPerPage: limit,
            },
          },
        };
      }

      query.manufacturer = { $in: manufacturerIds };
    }

    const categoryClause = await this._buildCategoryClause(categoryFilter);
    if (categoryClause) {
      query.$and.push(categoryClause);
    }

    const dosageClause = this._buildDosageClause(dosageFilter);
    if (dosageClause) {
      query.$and.push(dosageClause);
    }

    const prescriptionRequired = this._parsePrescriptionRequiredFilter(
      prescriptionStatusFilter
    );
    if (typeof prescriptionRequired === 'boolean') {
      query.prescription_required = prescriptionRequired;
    }

    const stockRows = await StockInHand.find({
      branch_id: { $in: branchIds },
      quantity: { $gt: 0 },
    })
      .select('medicine_id branch_id')
      .lean();

    const rankedMedicineIds = new Set();
    const medicineRankMap = new Map();
    for (const row of stockRows) {
      const medicineId = row.medicine_id?.toString();
      const branchId = row.branch_id?.toString();
      if (!medicineId || !branchId) continue;

      const rank = branchIndexMap.get(branchId) ?? 9999;
      rankedMedicineIds.add(medicineId);

      const existing = medicineRankMap.get(medicineId);
      if (existing == null || rank < existing) {
        medicineRankMap.set(medicineId, rank);
      }
    }

    if (!rankedMedicineIds.size) {
      return {
        success: true,
        data: {
          medicines: [],
          count: 0,
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalMedicines: 0,
            itemsPerPage: limit,
          },
        },
      };
    }

    query._id = { $in: [...rankedMedicineIds] };

    const allMatches = await Medicine.find(query)
      .populate('class', 'name')
      .lean();

    const sortedByBranchRank = allMatches.slice().sort((a, b) => {
      const branchRankA = medicineRankMap.get(a._id.toString()) ?? 9999;
      const branchRankB = medicineRankMap.get(b._id.toString()) ?? 9999;

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
    const customer = customerId
      ? await Customer.findById(customerId).populate('address_id')
      : null;

    const ranking = customer
      ? await this._getOrderedBranches(customer)
      : await this._getPublicOrderedBranches();
    const branches = ranking.orderedBranches;

    if (!branches.length) {
      return {
        success: true,
        data: {
          branches: [],
          count: 0,
        },
      };
    }

    const branchList = [];
    const seenNames = new Set();

    for (const branch of branches) {
      const name = String(branch?.name || '').trim();
      if (!name) continue;

      const key = name.toLowerCase();
      if (seenNames.has(key)) continue;

      seenNames.add(key);
      branchList.push({
        id: branch._id,
        name,
      });
    }

    return {
      success: true,
      data: {
        branches: branchList,
        count: branchList.length,
      },
    };
  }

  async _getAvailableMedicineIdsForCustomer(customerId) {
    const customer = customerId
      ? await Customer.findById(customerId).populate('address_id')
      : null;

    const ranking = customer
      ? await this._getOrderedBranches(customer)
      : await this._getPublicOrderedBranches();
    const branches = ranking.orderedBranches;
    if (!branches.length) {
      return [];
    }

    const branchIds = branches.map(branch => branch._id);
    const stockRows = await StockInHand.find({
      branch_id: { $in: branchIds },
      quantity: { $gt: 0 },
    })
      .select('medicine_id')
      .lean();

    return [
      ...new Set(
        stockRows.map(row => String(row.medicine_id || '')).filter(Boolean)
      ),
    ];
  }

  async getAvailableBrands(customerId) {
    const medicineIds =
      await this._getAvailableMedicineIdsForCustomer(customerId);
    if (!medicineIds.length) {
      return { success: true, data: { brands: [], count: 0 } };
    }

    const manufacturerNames = await Medicine.distinct('manufacturer', {
      _id: { $in: medicineIds },
      active: true,
      manufacturer: { $ne: null },
    });

    const brands = await Manufacturer.find({
      name: { $in: manufacturerNames },
    })
      .sort({ name: 1 })
      .select('_id name')
      .lean();

    const availableBrands = brands
      .map(item => ({
        id: item._id,
        name: item.name,
      }))
      .filter(item => item.name);

    return {
      success: true,
      data: { brands: availableBrands, count: availableBrands.length },
    };
  }

  async getAvailableClasses(customerId) {
    const medicineIds =
      await this._getAvailableMedicineIdsForCustomer(customerId);
    if (!medicineIds.length) {
      return { success: true, data: { classes: [], count: 0 } };
    }

    const classIds = await Medicine.distinct('class', {
      _id: { $in: medicineIds },
      active: true,
      class: { $ne: null },
    });

    const classes = await ItemClass.find({ _id: { $in: classIds } })
      .sort({ name: 1 })
      .select('_id name')
      .lean();

    const availableClasses = classes
      .map(item => ({
        id: item._id,
        name: item.name,
      }))
      .filter(item => item.name);

    return {
      success: true,
      data: { classes: availableClasses, count: availableClasses.length },
    };
  }

  async getAvailableCategories(customerId) {
    const medicineIds =
      await this._getAvailableMedicineIdsForCustomer(customerId);
    if (!medicineIds.length) {
      return { success: true, data: { categories: [], count: 0 } };
    }

    const categoryNames = await Medicine.distinct('category', {
      _id: { $in: medicineIds },
      active: true,
      category: { $ne: null },
    });

    const categoryDocs = await MedicineCategory.find({
      name: { $in: categoryNames },
    })
      .sort({ name: 1 })
      .select('_id name')
      .lean();

    const categories = categoryDocs
      .map(item => ({
        id: item._id,
        name: item.name,
      }))
      .filter(item => item.name)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: { categories, count: categories.length },
    };
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

    if (customerId) {
      const customer =
        await Customer.findById(customerId).populate('address_id');
      if (!customer) {
        throw new Error('CUSTOMER_NOT_FOUND');
      }
    }

    const inStock =
      (await StockInHand.exists({
        medicine_id: medicine._id,
        quantity: { $gt: 0 },
      })) != null;

    const relatedMedicinesResult = await this.getRelatedMedicines(
      medicineId,
      customerId,
      { limit: 5 }
    );

    return {
      success: true,
      data: {
        medicine: this._sanitizeMedicineForCustomer(medicine.toObject()),
        availability: {
          inStock,
        },
        related_medicines: relatedMedicinesResult?.data?.medicines || [],
      },
    };
  }

  async getMedicineRecommendations(customerId, options = {}) {
    const limit = Math.max(1, Math.min(Number(options.limit) || 8, 12));
    const { seedMedicineIds } =
      await this._getRecommendationSeedMedicines(customerId);

    const recommendations = [];
    const seenKeys = new Set();

    const pushMedicine = medicine => {
      if (!medicine) return;
      const key = this._buildRecommendationMedicineKey(medicine);
      if (!key || seenKeys.has(key)) return;
      seenKeys.add(key);
      recommendations.push(this._sanitizeMedicineForCustomer(medicine));
    };

    for (const seedMedicineId of seedMedicineIds) {
      const seedMedicine = await Medicine.findById(seedMedicineId)
        .select(
          'Name alias_name img_urls sale_price description mgs dosage_form category manufacturer prescription_required active'
        )
        .lean();

      if (!seedMedicine) continue;

      pushMedicine(seedMedicine);

      const relatedResult = await this.getRelatedMedicines(
        seedMedicineId,
        customerId,
        { limit: 6 }
      );

      for (const related of relatedResult?.data?.medicines || []) {
        pushMedicine(related);
      }

      if (recommendations.length >= limit) {
        break;
      }
    }

    if (recommendations.length < Math.min(5, limit)) {
      const fallback = await this._getFallbackMedicines(limit, seenKeys);
      recommendations.push(...fallback);
    }

    return {
      success: true,
      data: {
        recommendations: recommendations.slice(0, limit),
        count: Math.min(recommendations.length, limit),
      },
    };
  }

  async getRelatedMedicines(medicineId, customerId, options = {}) {
    const limit = Math.min(Number(options.limit) || 8, 20);

    const baseMedicine = await Medicine.findById(medicineId)
      .populate('class', 'name')
      .lean();

    if (!baseMedicine) {
      throw new Error('MEDICINE_NOT_FOUND');
    }

    const query = this._buildRelatedMedicineQuery(baseMedicine);
    if (!query) {
      return {
        success: true,
        data: {
          baseMedicine: this._sanitizeMedicineForCustomer(baseMedicine),
          medicines: [],
          count: 0,
        },
      };
    }

    const customer = customerId
      ? await Customer.findById(customerId).populate('address_id')
      : null;

    const ranking = customer
      ? await this._getOrderedBranches(customer)
      : await this._getPublicOrderedBranches();
    const branches = ranking.orderedBranches;
    const branchIds = branches.map(branch => branch._id);
    const branchIndexMap = new Map(
      branchIds.map((id, index) => [id.toString(), index])
    );

    const stockRows = await StockInHand.find({
      branch_id: { $in: branchIds },
      quantity: { $gt: 0 },
    })
      .select('medicine_id branch_id')
      .lean();

    const availableMedicineIds = [];
    const medicineRankMap = new Map();
    for (const row of stockRows) {
      const medicineId = row.medicine_id?.toString();
      const branchId = row.branch_id?.toString();
      if (!medicineId || !branchId) continue;

      availableMedicineIds.push(row.medicine_id);
      const rank = branchIndexMap.get(branchId) ?? 9999;
      const existingRank = medicineRankMap.get(medicineId);
      if (existingRank == null || rank < existingRank) {
        medicineRankMap.set(medicineId, rank);
      }
    }

    const matches = await Medicine.find({
      ...query,
      _id: {
        $in: availableMedicineIds,
      },
    })
      .populate('class', 'name')
      .lean();

    const sortedMatches = matches.slice().sort((a, b) => {
      const branchRankA = medicineRankMap.get(a._id.toString()) ?? 9999;
      const branchRankB = medicineRankMap.get(b._id.toString()) ?? 9999;

      if (branchRankA !== branchRankB) {
        return branchRankA - branchRankB;
      }

      return (a.Name || '').localeCompare(b.Name || '');
    });

    const seen = new Set();
    const deduped = [];

    for (const medicine of sortedMatches) {
      const key = this._buildMedicineIdentityKey(medicine);
      if (seen.has(key)) continue;

      seen.add(key);
      deduped.push(this._sanitizeMedicineForCustomer(medicine));

      if (deduped.length >= limit) {
        break;
      }
    }

    return {
      success: true,
      data: {
        baseMedicine: this._sanitizeMedicineForCustomer(baseMedicine),
        medicines: deduped,
        count: deduped.length,
      },
    };
  }
}

export default new MedicineCatalogService();
