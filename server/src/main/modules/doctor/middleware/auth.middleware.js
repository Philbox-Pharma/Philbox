import Doctor from '../../../models/Doctor.js'; // Adjust path to your Doctor model
import sendResponse from '../../../utils/sendResponse.js';

/**
 * Middleware to check if a Doctor is logged in via Session
 */
export async function authenticate(req, res, next) {
  try {
    // 1. Check if session exists and has a doctorId
    if (!req.session || !req.session.doctorId) {
      return sendResponse(res, 401, 'No session, authorization denied');
    }

    // 2. Fetch doctor from database
    const doctor = await Doctor.findById(req.session.doctorId).select(
      '-passwordHash'
    );

    if (!doctor) {
      // If session exists but ID is invalid (e.g. deleted user), clear session
      req.session.destroy();
      return sendResponse(res, 401, 'Doctor account not found');
    }

    // 3. Security Check: Block if account is blocked or under consideration
    if (doctor.account_status === 'blocked/removed') {
      req.session.destroy();
      return sendResponse(res, 403, 'Your account has been blocked.');
    }

    // Show message if account is under consideration
    if (doctor.account_status === 'under_consideration') {
      req.session.destroy();
      return sendResponse(
        res,
        403,
        'Your account is under consideration. Please wait for admin approval.'
      );
    }

    // 4. Attach doctor details to request object for downstream controllers
    req.doctor = {
      _id: doctor._id,
      id: doctor._id,
      email: doctor.email,
      fullName: doctor.fullName,
      status: doctor.account_status, // 'active', 'under_consideration', 'blocked/removed'
      isVerified: doctor.is_Verified,
      onboardingStatus: doctor.onboarding_status,
      roleId: doctor.roleId, // 🔐 RBAC - Include roleId for middleware
    };
    // Also set req.user for RBAC middleware compatibility
    req.user = req.doctor;

    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return sendResponse(res, 401, 'Session is not valid');
  }
}

/**
 * Middleware: Ensures the doctor's email is verified
 */
export async function isVerified(req, res, next) {
  if (!req.doctor) {
    return sendResponse(res, 401, 'Not Authenticated');
  }

  if (!req.doctor.isVerified) {
    return sendResponse(
      res,
      403,
      'Email not verified. Please verify your email first.'
    );
  }

  next();
}

/**
 * Middleware: Ensures the doctor is fully approved and active
 * (Replaces isSuperAdmin logic for Doctors)
 */
export async function isApprovedDoctor(req, res, next) {
  if (!req.doctor) {
    return sendResponse(res, 401, 'Not Authenticated');
  }

  // Only allow if status is 'active' (Admin has approved onboarding)
  if (req.doctor.status !== 'active') {
    const message =
      req.doctor.status === 'under_consideration'
        ? 'Access denied: Your account is under consideration. Please wait for admin approval.'
        : req.doctor.status === 'blocked/removed'
          ? 'Access denied: Your account has been blocked.'
          : 'Access denied: Your account is not active.';
    return sendResponse(res, 403, message);
  }

  next();
}
