import DoctorCatalogService from '../service/catalog.service.js';
import sendResponse from '../../../../../utils/sendResponse.js';
import { logCustomerActivity } from '../../../utils/logCustomerActivities.js';

class DoctorCatalogController {
  _getCustomerId(req) {
    return (
      req.user?.id ||
      req.user?._id ||
      req.customer?.id ||
      req.customer?._id ||
      req.session?.customerId ||
      null
    );
  }

  _parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? '').trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  async browseDoctors(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const result = await DoctorCatalogService.browseDoctors(customerId, {
        searchTerm: req.query.searchTerm || req.query.search || null,
        specialization: req.query.specialization || null,
        minFee: req.query.minFee ?? req.query.consultationFeeMin ?? null,
        maxFee: req.query.maxFee ?? req.query.consultationFeeMax ?? null,
        minRating: req.query.minRating ?? req.query.ratingMin ?? null,
        availability: req.query.availability || null,
        sortBy: req.query.sortBy || 'rating',
        sortOrder: req.query.sortOrder || 'desc',
        page: this._parsePositiveInt(req.query.page, 1),
        limit: this._parsePositiveInt(req.query.limit, 12),
      });

      const hasSearch = Boolean(
        String(req.query.searchTerm || req.query.search || '').trim()
      );

      await logCustomerActivity(
        req,
        hasSearch ? 'search_doctor_catalog' : 'view_doctor_catalog',
        hasSearch
          ? `Searched doctor catalog for ${req.query.searchTerm || req.query.search}`
          : 'Viewed doctor catalog',
        'doctors',
        null,
        {
          searchTerm: req.query.searchTerm || req.query.search || null,
          specialization: req.query.specialization || null,
          availability: req.query.availability || null,
        }
      );

      return sendResponse(
        res,
        200,
        'Doctors fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error browsing doctor catalog:', error);

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getSpecializations(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const result = await DoctorCatalogService.getSpecializations();

      await logCustomerActivity(
        req,
        'view_doctor_specializations',
        'Viewed doctor specialization filters',
        'doctors',
        null
      );

      return sendResponse(
        res,
        200,
        'Specializations fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error fetching doctor specializations:', error);
      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getDoctorProfile(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const { doctorId } = req.params;
      if (!doctorId) {
        return sendResponse(res, 400, 'Doctor ID is required');
      }

      const result = await DoctorCatalogService.getDoctorProfile(doctorId, {
        reviewsPage: this._parsePositiveInt(req.query.reviewsPage, 1),
        reviewsLimit: this._parsePositiveInt(req.query.reviewsLimit, 10),
      });

      await logCustomerActivity(
        req,
        'view_doctor_profile',
        `Viewed doctor profile for ${doctorId}`,
        'doctors',
        doctorId
      );

      return sendResponse(
        res,
        200,
        'Doctor profile fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error fetching doctor profile:', error);

      if (error.message === 'DOCTOR_NOT_FOUND') {
        return sendResponse(res, 404, 'Doctor not found');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getDoctorReviews(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const { doctorId } = req.params;
      if (!doctorId) {
        return sendResponse(res, 400, 'Doctor ID is required');
      }

      const result = await DoctorCatalogService.getDoctorReviews(doctorId, {
        page: this._parsePositiveInt(req.query.page, 1),
        limit: this._parsePositiveInt(req.query.limit, 10),
      });

      return sendResponse(
        res,
        200,
        'Doctor reviews fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error fetching doctor reviews:', error);

      if (error.message === 'DOCTOR_NOT_FOUND') {
        return sendResponse(res, 404, 'Doctor not found');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }

  async getDoctorAvailabilityCalendar(req, res) {
    try {
      const customerId = this._getCustomerId(req);
      if (!customerId) {
        return sendResponse(res, 401, 'Unauthorized');
      }

      const { doctorId } = req.params;
      if (!doctorId) {
        return sendResponse(res, 400, 'Doctor ID is required');
      }

      const result = await DoctorCatalogService.getDoctorAvailabilityCalendar(
        doctorId,
        {
          fromDate: req.query.fromDate || null,
          toDate: req.query.toDate || null,
          limitDays: this._parsePositiveInt(req.query.limitDays, 30),
        }
      );

      return sendResponse(
        res,
        200,
        'Doctor availability calendar fetched successfully',
        result.data
      );
    } catch (error) {
      console.error('Error fetching doctor availability calendar:', error);

      if (error.message === 'DOCTOR_NOT_FOUND') {
        return sendResponse(res, 404, 'Doctor not found');
      }

      return sendResponse(res, 500, 'Server Error', null, error.message);
    }
  }
}

export default new DoctorCatalogController();
