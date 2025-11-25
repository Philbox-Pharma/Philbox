import Admin from "../../../../../models/Admin.js";
import Branch from "../../../../../models/Branch.js";
import bcrypt from "bcryptjs";
import sendResponse from "../../../../../utils/sendResponse.js";
import { seedAddress } from "../../../utils/seedAddress.js";
import { logAdminActivity } from "../../../utils/logAdminActivities.js"; 
import { uploadToCloudinary } from "../../../../../utils/uploadToCloudinary.js";

// 🟩 CREATE Branch Admin
export const createBranchAdmin = async (req, res) => {
  try {
    const { name, email, password, phone_number, branches_managed = [], addresses = [] } = req.body;
    const profileImage = req.file; // multer adds this

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return sendResponse(res, 400, "Email already exists");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 🖼️ Upload image if provided
    let profile_img_url;
    if (profileImage) {
      profile_img_url = await uploadToCloudinary(profileImage.path, "branch_admins");
    }


    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone_number: phone_number || "",
      category: "branch-admin",
      branches_managed,
      profile_img_url,
    });

    for (let branchID of branches_managed) {
      const branch = await Branch.findById(branchID);
      if (branch) {
        branch.under_administration_of.push(newAdmin._id);
        await branch.save();
      }
    }

    const addressIds = [];
    for (let address of addresses) {
      address.id = newAdmin._id;
      const addressId = await seedAddress(address);
      addressIds.push(addressId);
    }
    newAdmin.addresses = addressIds;

    await newAdmin.save();

    await logAdminActivity(
      req,
      "create_branch_admin",
      `Super Admin with id ${req.admin._id} created branch admin '${name}' (${email})`,
      "admins",
      newAdmin._id,
      { new: newAdmin }
    );

    const { password: _, ...safeData } = newAdmin.toObject();
    return sendResponse(res, 201, "Branch Admin created successfully", safeData);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Server Error", null, err);
  }
};

// 🟦 READ ALL Branch Admins with Pagination
export const listAdmins = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    const { data, total, totalPages, currentPage } = await paginate(Admin, { category: "branch-admin" }, page, limit);
    if (!data.length)
      return sendResponse(res, 404, "No Branch Admins found");

    return sendResponse(res, 200, "Branch Admins fetched successfully", {
      total,
      totalPages,
      currentPage,
      limit,
      data,
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Server Error", null, err);
  }
};


// 🟦 READ ONE Branch Admin (Search)
export const searchBranchAdmin = async (req, res) => {
  try {
    const { id, email, name } = req.query;

    let query = { category: "branch-admin" };
    if (id) query._id = id;
    if (email) query.email = email.toLowerCase();
    if (name) query.name = { $regex: name, $options: "i" };

    const admin = await Admin.findOne(query)
      .select("-password")
      .populate("branches_managed", "branch_name city")
      .populate("addresses");

    if (!admin) return sendResponse(res, 404, "Branch Admin not found");

    return sendResponse(res, 200, "Branch Admin fetched successfully", admin);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Server Error", null, err);
  }
};

// 🟥 DELETE Branch Admin
export const removeBranchAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) return sendResponse(res, 404, "Admin not found");

    for (let branchID of admin.branches_managed) {
      const branch = await Branch.findById(branchID);
      if (branch) {
        branch.under_administration_of = branch.under_administration_of.filter(
          (adminId) => adminId.toString() !== id
        );
        await branch.save();
      }
    }

    await Admin.deleteOne({ _id: id });

    await logAdminActivity(
      req,
      "delete_branch_admin",
      `Super Admin deleted branch admin '${admin.name}' (${admin.email})`,
      "admins",
      id,
      { old: admin }
    );

    return sendResponse(res, 200, "Branch Admin removed successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Server Error", null, err);
  }
};

// 🟧 UPDATE Branch Admin
export const updateBranchAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone_number, password, branches_managed, addresses } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) return sendResponse(res, 404, "Branch Admin not found");

    const oldAdmin = admin.toObject();

    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (phone_number) admin.phone_number = phone_number;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }
    if (branches_managed) admin.branches_managed = branches_managed;

    if (addresses && addresses.length > 0) {
      const addressIds = [];
      for (let address of addresses) {
        address.id = admin._id;
        const addressId = await seedAddress(address);
        addressIds.push(addressId);
      }
      admin.addresses = addressIds;
    }

    await admin.save();

    await logAdminActivity(
      req,
      "update_branch_admin",
      `Super Admin updated branch admin '${admin.name}' (${admin.email})`,
      "admins",
      id,
      { old: oldAdmin, new: admin }
    );

    const { password: _, ...safeData } = admin.toObject();
    return sendResponse(res, 200, "Branch Admin updated successfully", safeData);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Server Error", null, err);
  }
};
