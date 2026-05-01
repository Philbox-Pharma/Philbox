import dotenv from 'dotenv';

import connectDB from '../../../main/config/db.config.js';
import Customer from '../../../main/models/Customer.js';
import Doctor from '../../../main/models/Doctor.js';
import DoctorCatalogService from '../../../main/modules/customer/features/doctor_catalog/service/catalog.service.js';

dotenv.config();

const fail = message => {
  throw new Error(message);
};

const resolveCustomerId = async () => {
  if (process.env.TEST_CUSTOMER_ID) {
    return process.env.TEST_CUSTOMER_ID;
  }

  const fallbackCustomer = await Customer.findOne({})
    .select('_id fullName')
    .lean();
  if (!fallbackCustomer?._id) {
    fail(
      'No customer found in database. Seed data first or provide TEST_CUSTOMER_ID.'
    );
  }

  return fallbackCustomer._id.toString();
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    fail('MONGO_URI is required.');
  }

  await connectDB(process.env.MONGO_URI);

  const customerId = await resolveCustomerId();

  const approvedDoctors = await Doctor.find({ account_status: 'active' })
    .select('_id fullName account_status')
    .lean();

  const nonApprovedDoctors = await Doctor.find({
    account_status: { $ne: 'active' },
  })
    .select('_id fullName account_status')
    .lean();

  const result = await DoctorCatalogService.browseDoctors(customerId, {
    page: 1,
    limit: 1000,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  if (!result?.success) {
    fail('Doctor catalog service returned an unsuccessful response.');
  }

  const catalogDoctors = result?.data?.doctors || [];
  const catalogDoctorIds = catalogDoctors.map(doctor => String(doctor._id));
  const catalogDoctorIdSet = new Set(catalogDoctorIds);

  const approvedDoctorIdSet = new Set(
    approvedDoctors.map(doctor => String(doctor._id))
  );

  const nonApprovedShown = nonApprovedDoctors.filter(doctor =>
    catalogDoctorIdSet.has(String(doctor._id))
  );

  if (nonApprovedShown.length > 0) {
    const names = nonApprovedShown
      .map(doctor => `${doctor.fullName} (${doctor.account_status})`)
      .join(', ');
    fail(`Catalog exposed non-approved doctors: ${names}`);
  }

  const unexpectedIds = catalogDoctorIds.filter(
    doctorId => !approvedDoctorIdSet.has(doctorId)
  );

  if (unexpectedIds.length > 0) {
    fail(
      `Catalog returned doctor IDs outside approved set: ${unexpectedIds.join(', ')}`
    );
  }

  if (result?.data?.pagination?.totalDoctors !== approvedDoctors.length) {
    fail(
      `Expected pagination totalDoctors to equal approved doctors count (${approvedDoctors.length}), but got ${result?.data?.pagination?.totalDoctors}.`
    );
  }

  console.log('='.repeat(72));
  console.log('Doctor Approval Filtering Test');
  console.log('='.repeat(72));
  console.log('Customer ID:', customerId);
  console.log('Approved doctors in DB:', approvedDoctors.length);
  console.log('Non-approved doctors in DB:', nonApprovedDoctors.length);
  console.log('Doctors returned in catalog:', catalogDoctors.length);
  console.log(
    'Catalog pagination totalDoctors:',
    result?.data?.pagination?.totalDoctors
  );
  console.log('='.repeat(72));
  console.log(
    'PASS: Customer doctor catalog only shows approved (active) doctors.'
  );
};

run()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('FAIL:', error.message);
    process.exit(1);
  });
