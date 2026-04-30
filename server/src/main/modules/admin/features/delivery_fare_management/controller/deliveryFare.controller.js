import sendResponse from '../../../../../utils/sendResponse.js';
import DeliveryFareService from '../services/deliveryFare.service.js';

class DeliveryFareController {
  async createFare(req, res) {
    try {
      const fare = await DeliveryFareService.createFare(req.body);
      return sendResponse(res, 201, 'Delivery fare created successfully', fare);
    } catch (error) {
      if (error.message === 'DELIVERY_FARE_RANGE_OVERLAP') {
        return sendResponse(
          res,
          409,
          'Delivery fare range overlaps with an existing active range'
        );
      }
      return sendResponse(
        res,
        500,
        'Failed to create delivery fare',
        null,
        error.message
      );
    }
  }

  async listFares(req, res) {
    try {
      const fares = await DeliveryFareService.listFares();
      return sendResponse(res, 200, 'Delivery fares retrieved successfully', {
        fares,
        count: fares.length,
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        'Failed to retrieve delivery fares',
        null,
        error.message
      );
    }
  }

  async updateFare(req, res) {
    try {
      const fare = await DeliveryFareService.updateFare(
        req.params.id,
        req.body
      );
      return sendResponse(res, 200, 'Delivery fare updated successfully', fare);
    } catch (error) {
      if (error.message === 'DELIVERY_FARE_NOT_FOUND') {
        return sendResponse(res, 404, 'Delivery fare not found');
      }
      if (error.message === 'DELIVERY_FARE_RANGE_OVERLAP') {
        return sendResponse(
          res,
          409,
          'Delivery fare range overlaps with an existing active range'
        );
      }
      return sendResponse(
        res,
        500,
        'Failed to update delivery fare',
        null,
        error.message
      );
    }
  }

  async deleteFare(req, res) {
    try {
      const fare = await DeliveryFareService.deleteFare(req.params.id);
      return sendResponse(res, 200, 'Delivery fare deleted successfully', fare);
    } catch (error) {
      if (error.message === 'DELIVERY_FARE_NOT_FOUND') {
        return sendResponse(res, 404, 'Delivery fare not found');
      }
      return sendResponse(
        res,
        500,
        'Failed to delete delivery fare',
        null,
        error.message
      );
    }
  }
}

export default new DeliveryFareController();
