import sendResponse from '../../../../../utils/sendResponse.js';
import * as prescriptionsService from '../service/prescriptions.service.js';

/**
 * Controller: Create a new prescription
 * POST /api/doctor/prescriptions
 */
export const createPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionsService.createPrescription(
      req,
      req.body
    );

    return sendResponse(
      res,
      201,
      'Prescription created successfully',
      prescription
    );
  } catch (error) {
    console.error('Create prescription error:', error);

    if (error.status === 404) {
      return sendResponse(res, 404, error.message);
    }

    if (error.status === 400) {
      return sendResponse(res, 400, error.message);
    }

    return sendResponse(
      res,
      500,
      'Failed to create prescription',
      null,
      error.message
    );
  }
};

/**
 * Controller: Get prescription by appointment ID
 * GET /api/doctor/prescriptions/:appointmentId
 */
export const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription =
      await prescriptionsService.getPrescriptionByAppointment(
        req,
        appointmentId
      );

    return sendResponse(
      res,
      200,
      'Prescription retrieved successfully',
      prescription
    );
  } catch (error) {
    console.error('Get prescription by appointment error:', error);

    if (error.status === 404) {
      return sendResponse(res, 404, error.message);
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve prescription',
      null,
      error.message
    );
  }
};

/**
 * Controller: Get all prescriptions for a patient
 * GET /api/doctor/prescriptions/patient/:patientId
 */
export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await prescriptionsService.getPrescriptionsByPatient(
      req,
      patientId
    );

    return sendResponse(
      res,
      200,
      'Prescriptions retrieved successfully',
      prescriptions
    );
  } catch (error) {
    console.error('Get prescriptions by patient error:', error);

    if (error.status === 403) {
      return sendResponse(res, 403, error.message);
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve prescriptions',
      null,
      error.message
    );
  }
};

/**
 * Controller: Update an existing prescription
 * PUT /api/doctor/prescriptions/:prescriptionId
 */
export const updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await prescriptionsService.updatePrescription(
      req,
      prescriptionId,
      req.body
    );

    return sendResponse(
      res,
      200,
      'Prescription updated successfully',
      prescription
    );
  } catch (error) {
    console.error('Update prescription error:', error);

    if (error.status === 404) {
      return sendResponse(res, 404, error.message);
    }

    if (error.status === 400) {
      return sendResponse(res, 400, error.message);
    }

    return sendResponse(
      res,
      500,
      'Failed to update prescription',
      null,
      error.message
    );
  }
};

/**
 * Controller: Get prescription PDF URL
 * GET /api/doctor/prescriptions/:prescriptionId/pdf
 */
export const getPrescriptionPDF = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const result = await prescriptionsService.getPrescriptionPDF(
      req,
      prescriptionId
    );

    return sendResponse(res, 200, 'PDF URL retrieved successfully', result);
  } catch (error) {
    console.error('Get prescription PDF error:', error);

    if (error.status === 404) {
      return sendResponse(res, 404, error.message);
    }

    return sendResponse(
      res,
      500,
      'Failed to retrieve PDF URL',
      null,
      error.message
    );
  }
};
