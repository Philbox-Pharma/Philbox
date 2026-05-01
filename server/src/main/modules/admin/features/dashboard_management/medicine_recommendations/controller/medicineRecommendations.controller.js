import sendResponse from '../../../../../../utils/sendResponse.js';
import adminMedicineRecommendationsService from '../services/medicineRecommendations.service.js';

export const getCustomerRecommendations = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result =
      await adminMedicineRecommendationsService.getCustomerRecommendations(
        customerId,
        req.query,
        req
      );

    return sendResponse(
      res,
      200,
      'Customer medicine recommendations retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getCustomerRecommendations:', error);

    if (error.message === 'CUSTOMER_NOT_FOUND') {
      return sendResponse(res, 404, 'Customer not found');
    }

    return sendResponse(res, 500, 'Failed to retrieve recommendations');
  }
};

export const getRecommendationInsights = async (req, res) => {
  try {
    const result =
      await adminMedicineRecommendationsService.getRecommendationInsights(
        req.query,
        req
      );

    return sendResponse(
      res,
      200,
      'Medicine recommendation insights retrieved successfully',
      result
    );
  } catch (error) {
    console.error('Error in getRecommendationInsights:', error);
    return sendResponse(res, 500, 'Failed to retrieve recommendation insights');
  }
};
