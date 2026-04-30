import mongoose from 'mongoose';

import Doctor from '../../../../../models/Doctor.js';
import DoctorSlot from '../../../../../models/DoctorSlot.js';
import Review from '../../../../../models/Review.js';

class DoctorCatalogService {
  _escapeRegex(value = '') {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? '').trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  _parseNumber(value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  _parseList(value) {
    if (Array.isArray(value)) {
      return value.map(item => String(item).trim()).filter(Boolean);
    }

    return String(value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  _buildSearchClause(searchTerm) {
    const term = String(searchTerm || '').trim();
    if (!term) {
      return null;
    }

    const escaped = this._escapeRegex(term);
    return {
      $or: [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { license_number: { $regex: escaped, $options: 'i' } },
        { affiliated_hospital: { $regex: escaped, $options: 'i' } },
        { specialization: { $elemMatch: { $regex: escaped, $options: 'i' } } },
      ],
    };
  }

  _buildSpecializationClause(specialization) {
    const values = this._parseList(specialization);
    if (!values.length) {
      return null;
    }

    return {
      $or: values.map(value => ({
        specialization: {
          $elemMatch: { $regex: this._escapeRegex(value), $options: 'i' },
        },
      })),
    };
  }

  _calculateExperienceYears(experienceDetails = []) {
    if (!Array.isArray(experienceDetails) || !experienceDetails.length) {
      return 0;
    }

    const now = new Date();
    let totalMonths = 0;

    for (const item of experienceDetails) {
      const startDate = item?.starting_date
        ? new Date(item.starting_date)
        : null;
      if (!startDate || Number.isNaN(startDate.getTime())) {
        continue;
      }

      const endDate = item?.ending_date ? new Date(item.ending_date) : now;
      const safeEndDate = Number.isNaN(endDate.getTime()) ? now : endDate;
      const years = safeEndDate.getFullYear() - startDate.getFullYear();
      const months = safeEndDate.getMonth() - startDate.getMonth();
      totalMonths +=
        years * 12 +
        months +
        (safeEndDate.getDate() >= startDate.getDate() ? 0 : -1);
    }

    return Number(Math.max(totalMonths / 12, 0).toFixed(1));
  }

  _startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  _endOfDay(date) {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  }

  _buildAvailabilityWindow(availability) {
    const todayStart = this._startOfDay(new Date());
    const todayEnd = this._endOfDay(new Date());
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    if (availability === 'today') {
      return {
        from: todayStart,
        to: todayEnd,
        label: 'today',
      };
    }

    if (availability === 'this_week' || availability === 'week') {
      return {
        from: todayStart,
        to: weekEnd,
        label: 'this_week',
      };
    }

    return null;
  }

  _formatSlot(slot) {
    if (!slot) {
      return null;
    }

    return {
      _id: slot._id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: slot.status,
    };
  }

  _formatReview(review) {
    return {
      _id: review._id,
      rating: Number(review.rating || 0),
      message: review.message || '',
      sentiment: review.sentiment || 'neutral',
      created_at: review.created_at,
      customer: {
        _id: review.customer_id?._id || null,
        fullName: review.customer_id?.fullName || 'Anonymous',
        profile_img_url: review.customer_id?.profile_img_url || null,
      },
    };
  }

  _groupSlotsByDate(slots = []) {
    const byDate = new Map();

    for (const slot of slots) {
      const dateObj = slot?.date ? new Date(slot.date) : null;
      if (!dateObj || Number.isNaN(dateObj.getTime())) {
        continue;
      }

      const key = dateObj.toISOString().split('T')[0];
      if (!byDate.has(key)) {
        byDate.set(key, []);
      }

      byDate.get(key).push(this._formatSlot(slot));
    }

    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, dateSlots]) => ({
        date,
        slots: dateSlots,
      }));
  }

  _buildDoctorCard(
    doctor,
    reviewStats,
    slotsByDoctor,
    todayWindow,
    weekWindow
  ) {
    const doctorId = String(doctor._id);
    const doctorSlots = slotsByDoctor.get(doctorId) || [];
    const todaySlots = doctorSlots.filter(slot => {
      const slotDate = this._startOfDay(slot.date);
      return slotDate >= todayWindow.from && slotDate <= todayWindow.to;
    });
    const weekSlots = doctorSlots.filter(slot => {
      const slotDate = this._startOfDay(slot.date);
      return slotDate >= weekWindow.from && slotDate <= weekWindow.to;
    });
    const nextAvailableSlot = doctorSlots[0]
      ? this._formatSlot(doctorSlots[0])
      : null;
    const stats = reviewStats.get(doctorId) || {
      reviewCount: 0,
      averageRating: 0,
    };

    return {
      _id: doctor._id,
      fullName: doctor.fullName,
      profile_img_url: doctor.profile_img_url,
      cover_img_url: doctor.cover_img_url,
      specialization: doctor.specialization || [],
      consultation_fee: Number(doctor.consultation_fee || 0),
      consultation_type: doctor.consultation_type || null,
      affiliated_hospital: doctor.affiliated_hospital || null,
      average_rating: Number(stats.averageRating || 0),
      review_count: Number(stats.reviewCount || 0),
      experience_years: this._calculateExperienceYears(
        doctor.experience_details
      ),
      available_today: todaySlots.length > 0,
      available_this_week: weekSlots.length > 0,
      available_slot_count: doctorSlots.length,
      today_slot_count: todaySlots.length,
      week_slot_count: weekSlots.length,
      next_available_slot: nextAvailableSlot,
    };
  }

  _sortDoctors(doctors, sortBy, sortOrder) {
    const direction =
      String(sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const normalizedSort = String(sortBy || 'rating').toLowerCase();

    const comparatorMap = {
      rating: (a, b) => (a.average_rating - b.average_rating) * direction,
      fee: (a, b) => (a.consultation_fee - b.consultation_fee) * direction,
      experience: (a, b) =>
        (a.experience_years - b.experience_years) * direction,
      name: (a, b) =>
        a.fullName.localeCompare(b.fullName, undefined, {
          sensitivity: 'base',
        }) * direction,
      newest: (a, b) =>
        (new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()) *
        direction,
    };

    const comparator = comparatorMap[normalizedSort] || comparatorMap.rating;

    return doctors.slice().sort((a, b) => {
      const primary = comparator(a, b);
      if (primary !== 0) {
        return primary;
      }

      return a.fullName.localeCompare(b.fullName, undefined, {
        sensitivity: 'base',
      });
    });
  }

  async browseDoctors(customerId, filters = {}) {
    const page = this._parsePositiveInt(filters.page, 1);
    const limit = this._parsePositiveInt(filters.limit, 12);
    const searchTerm = String(filters.searchTerm || '').trim();
    const availability = String(filters.availability || '')
      .trim()
      .toLowerCase();
    const minFee = this._parseNumber(filters.minFee);
    const maxFee = this._parseNumber(filters.maxFee);
    const minRating = this._parseNumber(filters.minRating);
    const sortBy = String(filters.sortBy || 'rating').trim();
    const sortOrder = String(filters.sortOrder || 'desc').trim();

    const query = {
      account_status: 'active',
    };

    const andClauses = [];

    const searchClause = this._buildSearchClause(searchTerm);
    if (searchClause) {
      andClauses.push(searchClause);
    }

    const specializationClause = this._buildSpecializationClause(
      filters.specialization
    );
    if (specializationClause) {
      andClauses.push(specializationClause);
    }

    if (minFee !== null || maxFee !== null) {
      query.consultation_fee = {};
      if (minFee !== null) {
        query.consultation_fee.$gte = minFee;
      }
      if (maxFee !== null) {
        query.consultation_fee.$lte = maxFee;
      }
    }

    if (andClauses.length) {
      query.$and = andClauses;
    }

    let doctors = await Doctor.find(query)
      .select(
        'fullName profile_img_url cover_img_url specialization consultation_fee consultation_type affiliated_hospital experience_details created_at averageRating'
      )
      .lean();

    if (!doctors.length) {
      return {
        success: true,
        data: {
          doctors: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalDoctors: 0,
            itemsPerPage: limit,
          },
          appliedFilters: {
            searchTerm: searchTerm || null,
            specialization: this._parseList(filters.specialization),
            minFee,
            maxFee,
            minRating,
            availability: availability || null,
            sortBy,
            sortOrder,
          },
        },
      };
    }

    const doctorIds = doctors.map(doctor => doctor._id);
    const doctorObjectIds = doctorIds.map(
      id => new mongoose.Types.ObjectId(id)
    );

    const todayStart = this._startOfDay(new Date());
    const todayEnd = this._endOfDay(new Date());
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const slotSearchEnd = new Date(todayStart);
    slotSearchEnd.setDate(slotSearchEnd.getDate() + 90);
    slotSearchEnd.setHours(23, 59, 59, 999);

    const slotWindow = this._buildAvailabilityWindow(availability);
    const slotQuery = {
      doctor_id: { $in: doctorObjectIds },
      status: 'available',
      date: {
        $gte: todayStart,
        $lte: slotSearchEnd,
      },
    };

    const [reviewStats, availableSlots] = await Promise.all([
      Review.aggregate([
        {
          $match: {
            target_type: 'doctor',
            target_id: { $in: doctorObjectIds },
          },
        },
        {
          $group: {
            _id: '$target_id',
            reviewCount: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ]),
      DoctorSlot.find(slotQuery)
        .select('doctor_id date start_time end_time status')
        .sort({ date: 1, start_time: 1 })
        .lean(),
    ]);

    const reviewStatsMap = new Map(
      reviewStats.map(item => [String(item._id), item])
    );

    const slotsByDoctor = new Map();
    for (const slot of availableSlots) {
      const doctorId = String(slot.doctor_id);
      if (!slotsByDoctor.has(doctorId)) {
        slotsByDoctor.set(doctorId, []);
      }
      slotsByDoctor.get(doctorId).push(slot);
    }

    let doctorCards = doctors.map(doctor =>
      this._buildDoctorCard(
        doctor,
        reviewStatsMap,
        slotsByDoctor,
        { from: todayStart, to: todayEnd },
        { from: todayStart, to: weekEnd }
      )
    );

    if (minRating !== null) {
      doctorCards = doctorCards.filter(
        doctor => doctor.average_rating >= minRating
      );
    }

    if (slotWindow) {
      doctorCards = doctorCards.filter(doctor => {
        if (slotWindow.label === 'today') {
          return doctor.available_today;
        }

        if (slotWindow.label === 'this_week') {
          return doctor.available_this_week;
        }

        return true;
      });
    }

    doctorCards = this._sortDoctors(doctorCards, sortBy, sortOrder);

    const totalDoctors = doctorCards.length;
    const totalPages = Math.ceil(totalDoctors / limit);
    const startIndex = (page - 1) * limit;
    const paginatedDoctors = doctorCards.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        doctors: paginatedDoctors,
        pagination: {
          currentPage: page,
          totalPages,
          totalDoctors,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        appliedFilters: {
          searchTerm: searchTerm || null,
          specialization: this._parseList(filters.specialization),
          minFee,
          maxFee,
          minRating,
          availability: availability || null,
          sortBy,
          sortOrder,
        },
      },
    };
  }

  async getSpecializations() {
    const specializations = await Doctor.aggregate([
      {
        $match: {
          account_status: 'active',
        },
      },
      { $unwind: '$specialization' },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      success: true,
      data: {
        specializations: specializations.map(item => ({
          name: item._id,
          count: item.count,
        })),
      },
    };
  }

  async getDoctorProfile(doctorId, options = {}) {
    const reviewsPage = this._parsePositiveInt(options.reviewsPage, 1);
    const reviewsLimit = this._parsePositiveInt(options.reviewsLimit, 10);

    const doctor = await Doctor.findOne({
      _id: doctorId,
      account_status: 'active',
    })
      .select(
        '-passwordHash -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt'
      )
      .lean();

    if (!doctor) {
      throw new Error('DOCTOR_NOT_FOUND');
    }

    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
    const todayStart = this._startOfDay(new Date());
    const profileWindowEnd = new Date(todayStart);
    profileWindowEnd.setDate(profileWindowEnd.getDate() + 90);
    profileWindowEnd.setHours(23, 59, 59, 999);

    const [
      reviewSummary,
      ratingDistribution,
      availableSlots,
      reviews,
      totalReviews,
    ] = await Promise.all([
      Review.aggregate([
        {
          $match: {
            target_type: 'doctor',
            target_id: doctorObjectId,
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ]),
      Review.aggregate([
        {
          $match: {
            target_type: 'doctor',
            target_id: doctorObjectId,
          },
        },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
      DoctorSlot.find({
        doctor_id: doctorObjectId,
        status: 'available',
        date: {
          $gte: todayStart,
          $lte: profileWindowEnd,
        },
      })
        .select('date start_time end_time status')
        .sort({ date: 1, start_time: 1 })
        .limit(10)
        .lean(),
      Review.find({
        target_type: 'doctor',
        target_id: doctorObjectId,
      })
        .populate('customer_id', 'fullName profile_img_url')
        .sort({ created_at: -1 })
        .skip((reviewsPage - 1) * reviewsLimit)
        .limit(reviewsLimit)
        .lean(),
      Review.countDocuments({
        target_type: 'doctor',
        target_id: doctorObjectId,
      }),
    ]);

    const reviewSummaryData = reviewSummary[0] || {
      totalReviews: 0,
      averageRating: 0,
    };

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of ratingDistribution) {
      ratingCounts[item._id] = item.count;
    }

    const todayEnd = this._endOfDay(new Date());
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const todayAvailableSlots = availableSlots.filter(slot => {
      const slotDate = this._startOfDay(slot.date);
      return slotDate >= todayStart && slotDate <= todayEnd;
    });

    const weekAvailableSlots = availableSlots.filter(slot => {
      const slotDate = this._startOfDay(slot.date);
      return slotDate >= todayStart && slotDate <= weekEnd;
    });

    const availabilityCalendar = this._groupSlotsByDate(availableSlots);

    return {
      success: true,
      data: {
        doctor: {
          ...doctor,
          consultation_fee: Number(doctor.consultation_fee || 0),
          average_rating: Number(reviewSummaryData.averageRating || 0),
          review_count: Number(reviewSummaryData.totalReviews || 0),
          experience_years: this._calculateExperienceYears(
            doctor.experience_details
          ),
          qualifications: doctor.educational_details || [],
          about_bio: doctor.bio || '',
        },
        review_summary: {
          total_reviews: Number(reviewSummaryData.totalReviews || 0),
          average_rating: Number(reviewSummaryData.averageRating || 0),
          rating_distribution: ratingCounts,
        },
        patient_reviews: reviews.map(review => this._formatReview(review)),
        reviews_pagination: {
          current_page: reviewsPage,
          total_pages: Math.ceil(totalReviews / reviewsLimit),
          total_items: totalReviews,
          items_per_page: reviewsLimit,
          has_next: reviewsPage * reviewsLimit < totalReviews,
          has_prev: reviewsPage > 1,
        },
        availability: {
          available_today: todayAvailableSlots.length > 0,
          available_this_week: weekAvailableSlots.length > 0,
          today_slot_count: todayAvailableSlots.length,
          week_slot_count: weekAvailableSlots.length,
          next_available_slots: availableSlots.map(slot =>
            this._formatSlot(slot)
          ),
          calendar: availabilityCalendar,
        },
        booking: {
          action: 'BOOK_APPOINTMENT',
          endpoint: '/api/customer/appointments/requests',
          method: 'POST',
          required_fields: [
            'doctor_id',
            'appointment_type',
            'consultation_reason',
            'preferred_date',
          ],
        },
      },
    };
  }

  async getDoctorReviews(doctorId, options = {}) {
    const page = this._parsePositiveInt(options.page, 1);
    const limit = this._parsePositiveInt(options.limit, 10);

    const doctor = await Doctor.findOne({
      _id: doctorId,
      account_status: 'active',
    })
      .select('_id')
      .lean();

    if (!doctor) {
      throw new Error('DOCTOR_NOT_FOUND');
    }

    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
    const [reviews, total] = await Promise.all([
      Review.find({
        target_type: 'doctor',
        target_id: doctorObjectId,
      })
        .populate('customer_id', 'fullName profile_img_url')
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments({
        target_type: 'doctor',
        target_id: doctorObjectId,
      }),
    ]);

    return {
      success: true,
      data: {
        reviews: reviews.map(review => this._formatReview(review)),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
          has_next: page * limit < total,
          has_prev: page > 1,
        },
      },
    };
  }

  async getDoctorAvailabilityCalendar(doctorId, options = {}) {
    const doctor = await Doctor.findOne({
      _id: doctorId,
      account_status: 'active',
    })
      .select('_id')
      .lean();

    if (!doctor) {
      throw new Error('DOCTOR_NOT_FOUND');
    }

    const todayStart = this._startOfDay(new Date());
    let fromDate = options.fromDate ? new Date(options.fromDate) : todayStart;
    if (Number.isNaN(fromDate.getTime())) {
      fromDate = todayStart;
    }
    fromDate = this._startOfDay(fromDate);

    let toDate = options.toDate ? new Date(options.toDate) : null;
    if (!toDate || Number.isNaN(toDate.getTime())) {
      toDate = new Date(fromDate);
      const limitDays = Math.min(
        this._parsePositiveInt(options.limitDays, 30),
        90
      );
      toDate.setDate(toDate.getDate() + Math.max(limitDays - 1, 0));
    }
    toDate = this._endOfDay(toDate);

    const slots = await DoctorSlot.find({
      doctor_id: doctor._id,
      status: 'available',
      date: {
        $gte: fromDate,
        $lte: toDate,
      },
    })
      .select('date start_time end_time status')
      .sort({ date: 1, start_time: 1 })
      .lean();

    const calendar = this._groupSlotsByDate(slots);

    return {
      success: true,
      data: {
        from_date: fromDate,
        to_date: toDate,
        total_slots: slots.length,
        calendar,
      },
    };
  }
}

export default new DoctorCatalogService();
