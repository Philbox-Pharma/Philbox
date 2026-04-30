import dotenv from 'dotenv';

import connectDB from '../../../main/config/db.config.js';
import '../../../main/models/Address.js';
import Customer from '../../../main/models/Customer.js';
import Cart from '../../../main/models/Cart.js';
import CartItem from '../../../main/models/CartItem.js';
import Branch from '../../../main/models/Branch.js';
import StockInHand from '../../../main/models/StockInHand.js';
import MedicineCatalogService from '../../../main/modules/customer/features/medicine_catalog/service/catalog.service.js';
import { rankBranchesByProximityAsync } from '../../../main/utils/proximityCalculator.js';

dotenv.config();

const customerId = process.env.TEST_CUSTOMER_ID;
const expectedMode = String(process.env.TEST_EXPECTED_MODE || 'auto')
  .trim()
  .toLowerCase();
const limit = Math.max(
  1,
  Math.min(Number.parseInt(process.env.TEST_LIMIT || '5', 10) || 5, 20)
);
const sortBy = process.env.TEST_SORT_BY || 'name';

const fail = message => {
  throw new Error(message);
};

const formatBranch = branch => {
  if (!branch) return '(none)';
  return `${branch.name || 'Unnamed branch'} (${branch._id})`;
};

const getDominantCartBranchId = async customerObjectId => {
  const cart = await Cart.findOne({ customer_id: customerObjectId })
    .select('_id')
    .lean();

  if (!cart) return null;

  const cartItems = await CartItem.find({ cart_id: cart._id })
    .select('branch_id quantity')
    .lean();

  if (!cartItems.length) return null;

  const branchQuantityMap = new Map();
  for (const item of cartItems) {
    const branchKey = item.branch_id?.toString();
    const quantity = Math.max(0, Number(item.quantity) || 0);

    if (!branchKey || !quantity) continue;

    branchQuantityMap.set(
      branchKey,
      (branchQuantityMap.get(branchKey) || 0) + quantity
    );
  }

  let dominantBranchId = null;
  let dominantQuantity = -1;

  for (const [branchKey, quantity] of branchQuantityMap.entries()) {
    if (quantity > dominantQuantity) {
      dominantQuantity = quantity;
      dominantBranchId = branchKey;
    }
  }

  return dominantBranchId;
};

const computeExpectedBranchOrder = async customer => {
  const activeBranches = await Branch.find({ status: 'Active' }).populate(
    'address_id'
  );

  const dominantCartBranchId = await getDominantCartBranchId(customer._id);
  const proximityRankedBranches = customer.address_id
    ? await rankBranchesByProximityAsync(customer.address_id, activeBranches)
    : activeBranches;

  if (!dominantCartBranchId) {
    return {
      rankingMode: customer.address_id
        ? 'proximity_only'
        : 'no_address_no_cart',
      orderedBranches: proximityRankedBranches,
      prioritizedBranchId: null,
    };
  }

  const prioritizedBranch = proximityRankedBranches.find(
    branch => branch._id.toString() === dominantCartBranchId
  );

  if (!prioritizedBranch) {
    return {
      rankingMode: customer.address_id
        ? 'proximity_only'
        : 'no_address_no_cart',
      orderedBranches: proximityRankedBranches,
      prioritizedBranchId: null,
    };
  }

  return {
    rankingMode: customer.address_id
      ? 'cart_priority_then_proximity'
      : 'cart_priority_no_address',
    orderedBranches: [
      prioritizedBranch,
      ...proximityRankedBranches.filter(
        branch => branch._id.toString() !== dominantCartBranchId
      ),
    ],
    prioritizedBranchId: dominantCartBranchId,
  };
};

const buildMedicineBranchRankMap = async (medicineIds, orderedBranches) => {
  const branchIndexMap = new Map(
    orderedBranches.map((branch, index) => [branch._id.toString(), index])
  );

  const branchIds = orderedBranches.map(branch => branch._id);
  const stockRows = await StockInHand.find({
    medicine_id: { $in: medicineIds },
    branch_id: { $in: branchIds },
    quantity: { $gt: 0 },
  })
    .select('medicine_id branch_id quantity')
    .lean();

  const medicineBranchMap = new Map();

  for (const row of stockRows) {
    const medicineKey = row.medicine_id?.toString();
    const branchKey = row.branch_id?.toString();

    if (!medicineKey || !branchKey) continue;

    const rank = branchIndexMap.get(branchKey);
    if (rank == null) continue;

    const existing = medicineBranchMap.get(medicineKey);
    if (!existing || rank < existing.rank) {
      medicineBranchMap.set(medicineKey, {
        branchId: branchKey,
        rank,
      });
    }
  }

  return medicineBranchMap;
};

const run = async () => {
  if (!customerId) {
    fail('TEST_CUSTOMER_ID is required.');
  }

  if (!process.env.MONGO_URI) {
    fail('MONGO_URI is required.');
  }

  if (!['auto', 'cart', 'proximity'].includes(expectedMode)) {
    fail('TEST_EXPECTED_MODE must be one of: auto, cart, proximity.');
  }

  await connectDB(process.env.MONGO_URI);

  const customer = await Customer.findById(customerId).populate('address_id');
  if (!customer) {
    fail(`Customer not found: ${customerId}`);
  }

  const expected = await computeExpectedBranchOrder(customer);
  const dominantCartBranchId = await getDominantCartBranchId(customer._id);
  const dominantCartBranch = dominantCartBranchId
    ? await Branch.findById(dominantCartBranchId).select('name').lean()
    : null;

  const serviceResult = await MedicineCatalogService.browseMedicines(
    customerId,
    {
      page: 1,
      limit,
      sortBy,
    }
  );

  const medicines = serviceResult?.data?.medicines || [];
  if (!medicines.length) {
    fail(
      'No medicines were returned for this customer. The ranking test cannot validate the page state.'
    );
  }

  const branchRankMap = await buildMedicineBranchRankMap(
    medicines.map(medicine => medicine._id),
    expected.orderedBranches
  );

  const firstMedicine = medicines[0];
  const firstMedicineBranch = branchRankMap.get(firstMedicine._id.toString());

  if (!firstMedicineBranch) {
    fail(
      `The top medicine (${firstMedicine.Name || firstMedicine._id}) could not be mapped to an in-stock branch.`
    );
  }

  const expectedTopBranch = expected.orderedBranches[0];
  if (!expectedTopBranch) {
    fail('No active branches were found, so the ranking test cannot continue.');
  }

  const expectedModeResolved =
    expectedMode === 'auto'
      ? expected.rankingMode
      : expectedMode === 'cart'
        ? dominantCartBranchId
          ? 'cart_priority_then_proximity'
          : 'cart_priority_no_address'
        : customer.address_id
          ? 'proximity_only'
          : 'no_address_no_cart';

  if (
    expectedMode !== 'auto' &&
    expectedModeResolved !== expected.rankingMode &&
    !(
      expectedMode === 'cart' &&
      expected.rankingMode.startsWith('cart_priority')
    ) &&
    !(expectedMode === 'proximity' && expected.rankingMode === 'proximity_only')
  ) {
    fail(
      `Requested mode ${expectedMode} does not match the inferred ranking mode ${expected.rankingMode}.`
    );
  }

  const passed =
    firstMedicineBranch.branchId === expectedTopBranch._id.toString();

  console.log('='.repeat(72));
  console.log('Medicine Catalog Ranking Test');
  console.log('='.repeat(72));
  console.log(
    'Customer:',
    `${customer.fullName || 'Unnamed customer'} (${customer._id})`
  );
  console.log('Customer city:', customer.address_id?.city || '(no address)');
  console.log('Expected mode:', expected.rankingMode);
  console.log('Dominant cart branch:', formatBranch(dominantCartBranch));
  console.log('Expected top branch:', formatBranch(expectedTopBranch));
  console.log(
    'Top medicine:',
    `${firstMedicine.Name || '(unnamed)'} (${firstMedicine._id})`
  );
  console.log('Top medicine best branch rank:', firstMedicineBranch.rank);
  console.log('Top medicine best branch ID:', firstMedicineBranch.branchId);
  console.log('Returned medicines:', medicines.length);
  console.log('Sort by:', sortBy);
  console.log('Limit:', limit);
  console.log('='.repeat(72));

  if (!passed) {
    fail(
      `Expected the first medicine to come from ${formatBranch(expectedTopBranch)}, but it was best matched to branch ${firstMedicineBranch.branchId}.`
    );
  }

  console.log(
    'PASS: The medicines page ordering follows the expected branch ranking.'
  );
};

run()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('FAIL:', error.message);
    process.exit(1);
  });
