import Salesperson from '../../../../../models/Salesperson.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import bcrypt from 'bcryptjs';
import { seedAddress } from '../../../utils/seedAddress.js';

export const createSalesperson = async (req, res) => {
  try {
    const {
      fullName,
      gender,
      dateOfBirth,
      contactNumber,
      email,
      password,
      branches_to_be_managed,
      status,
      city,
      province,
      zip_code,
      country,
      google_map_link,
    } = req.body;

    status = status ? status : 'active';
    google_map_link = google_map_link ? google_map_link : '';
    dateOfBirth = dateOfBirth ? dateOfBirth : '';
    branches_to_be_managed = branches_to_be_managed
      ? branches_to_be_managed
      : [];
    zip_code = zip_code ? zip_code : '';

    const salesperson = new Salesperson({
      fullName,
      gender,
      dateOfBirth,
      contactNumber,
      email,
      passwordHash: async function () {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
      },
      branches_to_be_managed,
      status,
    });
    await salesperson.save();

    const address = await seedAddress({
      street,
      city,
      province,
      zip_code,
      country,
      google_map_link,
      address_of_persons_id: salesperson._id,
    });

    salesperson.passwordHash = null;
    return sendResponse(
      res,
      201,
      'Salesperson added Successfully',
      { salesperson, address },
      null
    );
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, 'Server Error', null, err);
  }
};

export const listSalespersons = async (req, res) => {
  const salesperson = await Salesperson.find();
  res.json(salesperson);
};
