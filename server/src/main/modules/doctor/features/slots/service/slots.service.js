import DoctorSlot from '../../../../../models/DoctorSlot.js';
import { logDoctorActivity } from '../../../utils/logDoctorActivities.js';

class DoctorSlotsService {
  /**
   * Create a single time slot
   */
  async createSlot(doctorId, slotData, req) {
    try {
      const { date, start_time, end_time, slot_duration, notes } = slotData;

      // Validate that end_time is after start_time
      if (start_time >= end_time) {
        throw new Error('END_TIME_BEFORE_START');
      }

      // Check for overlapping slots
      const overlapping = await DoctorSlot.findOne({
        doctor_id: doctorId,
        date: new Date(date),
        status: { $ne: 'unavailable' },
        $or: [
          {
            start_time: { $lt: end_time },
            end_time: { $gt: start_time },
          },
        ],
      });

      if (overlapping) {
        throw new Error('SLOT_OVERLAP');
      }

      const newSlot = await DoctorSlot.create({
        doctor_id: doctorId,
        date: new Date(date),
        start_time,
        end_time,
        slot_duration: slot_duration || 30,
        notes: notes || '',
        is_recurring: false,
      });

      await logDoctorActivity(
        req,
        'slot_create',
        `Created time slot for ${date}`,
        'doctor_slots',
        newSlot._id
      );

      return newSlot;
    } catch (error) {
      console.error('Error in createSlot:', error);
      throw error;
    }
  }

  /**
   * Create recurring time slots
   */
  async createRecurringSlots(doctorId, slotData, req) {
    try {
      const { start_time, end_time, slot_duration, recurring_pattern, notes } =
        slotData;

      // Validate that end_time is after start_time
      if (start_time >= end_time) {
        throw new Error('END_TIME_BEFORE_START');
      }

      const { frequency, days_of_week, start_date, end_date } =
        recurring_pattern;

      const slots = [];
      const startDate = new Date(start_date);
      const endDateObj = new Date(end_date);

      let currentDate = new Date(startDate);

      while (currentDate <= endDateObj) {
        let shouldCreateSlot = false;

        if (frequency === 'daily') {
          shouldCreateSlot = true;
        } else if (frequency === 'weekly') {
          const dayOfWeek = currentDate.getDay();
          shouldCreateSlot = days_of_week.includes(dayOfWeek);
        } else if (frequency === 'monthly') {
          // Create slot on the same day of each month
          shouldCreateSlot = currentDate.getDate() === startDate.getDate();
        }

        if (shouldCreateSlot) {
          // Check for overlapping slots
          const overlapping = await DoctorSlot.findOne({
            doctor_id: doctorId,
            date: currentDate,
            status: { $ne: 'unavailable' },
            $or: [
              {
                start_time: { $lt: end_time },
                end_time: { $gt: start_time },
              },
            ],
          });

          if (!overlapping) {
            const slot = await DoctorSlot.create({
              doctor_id: doctorId,
              date: new Date(currentDate),
              start_time,
              end_time,
              slot_duration: slot_duration || 30,
              notes: notes || '',
              is_recurring: true,
              recurring_pattern: {
                frequency,
                days_of_week: days_of_week || [],
                end_date: endDateObj,
              },
            });
            slots.push(slot);
          }
        }

        // Move to next day
        if (frequency === 'daily' || frequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      await logDoctorActivity(
        req,
        'recurring_slots_create',
        `Created ${slots.length} recurring time slots`,
        'doctor_slots',
        null
      );

      return slots;
    } catch (error) {
      console.error('Error in createRecurringSlots:', error);
      throw error;
    }
  }

  /**
   * Get doctor's slots with filtering
   */
  async getSlots(doctorId, filters) {
    try {
      const query = { doctor_id: doctorId };

      if (filters.start_date && filters.end_date) {
        query.date = {
          $gte: new Date(filters.start_date),
          $lte: new Date(filters.end_date),
        };
      } else if (filters.start_date) {
        query.date = { $gte: new Date(filters.start_date) };
      } else if (filters.end_date) {
        query.date = { $lte: new Date(filters.end_date) };
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const slots = await DoctorSlot.find(query)
        .populate('appointment_id', 'customer_id status')
        .sort({ date: 1, start_time: 1 });

      return slots;
    } catch (error) {
      console.error('Error in getSlots:', error);
      throw error;
    }
  }

  /**
   * Get a single slot by ID
   */
  async getSlotById(doctorId, slotId) {
    try {
      const slot = await DoctorSlot.findOne({
        _id: slotId,
        doctor_id: doctorId,
      }).populate('appointment_id', 'customer_id status');

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      return slot;
    } catch (error) {
      console.error('Error in getSlotById:', error);
      throw error;
    }
  }

  /**
   * Update a slot (only if not booked and in future)
   */
  async updateSlot(doctorId, slotId, updateData, req) {
    try {
      const slot = await DoctorSlot.findOne({
        _id: slotId,
        doctor_id: doctorId,
      });

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      // Cannot update booked slots
      if (slot.status === 'booked') {
        throw new Error('CANNOT_UPDATE_BOOKED_SLOT');
      }

      // Cannot update past slots
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (slotDate < today) {
        throw new Error('CANNOT_UPDATE_PAST_SLOT');
      }

      // Check for overlapping if time is being updated
      if (updateData.start_time || updateData.end_time) {
        const start_time = updateData.start_time || slot.start_time;
        const end_time = updateData.end_time || slot.end_time;

        if (start_time >= end_time) {
          throw new Error('END_TIME_BEFORE_START');
        }

        const overlapping = await DoctorSlot.findOne({
          _id: { $ne: slotId },
          doctor_id: doctorId,
          date: slot.date,
          status: { $ne: 'unavailable' },
          $or: [
            {
              start_time: { $lt: end_time },
              end_time: { $gt: start_time },
            },
          ],
        });

        if (overlapping) {
          throw new Error('SLOT_OVERLAP');
        }
      }

      Object.assign(slot, updateData);
      await slot.save();

      await logDoctorActivity(
        req,
        'slot_update',
        `Updated time slot ${slotId}`,
        'doctor_slots',
        slotId
      );

      return slot;
    } catch (error) {
      console.error('Error in updateSlot:', error);
      throw error;
    }
  }

  /**
   * Delete a slot (only if not booked and in future)
   */
  async deleteSlot(doctorId, slotId, req) {
    try {
      const slot = await DoctorSlot.findOne({
        _id: slotId,
        doctor_id: doctorId,
      });

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      // Cannot delete booked slots
      if (slot.status === 'booked') {
        throw new Error('CANNOT_DELETE_BOOKED_SLOT');
      }

      // Cannot delete past slots
      const slotDate = new Date(slot.date);
      slotDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (slotDate < today) {
        throw new Error('CANNOT_DELETE_PAST_SLOT');
      }

      await DoctorSlot.deleteOne({ _id: slotId });

      await logDoctorActivity(
        req,
        'slot_delete',
        `Deleted time slot ${slotId}`,
        'doctor_slots',
        slotId
      );

      return { success: true };
    } catch (error) {
      console.error('Error in deleteSlot:', error);
      throw error;
    }
  }

  /**
   * Mark slot as unavailable
   */
  async markSlotUnavailable(doctorId, slotId, req) {
    try {
      const slot = await DoctorSlot.findOne({
        _id: slotId,
        doctor_id: doctorId,
      });

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      if (slot.status === 'booked') {
        throw new Error('CANNOT_MODIFY_BOOKED_SLOT');
      }

      slot.status = 'unavailable';
      await slot.save();

      await logDoctorActivity(
        req,
        'slot_unavailable',
        `Marked slot ${slotId} as unavailable`,
        'doctor_slots',
        slotId
      );

      return slot;
    } catch (error) {
      console.error('Error in markSlotUnavailable:', error);
      throw error;
    }
  }

  /**
   * Get calendar view (monthly)
   */
  async getCalendarView(doctorId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const slots = await DoctorSlot.find({
        doctor_id: doctorId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1, start_time: 1 });

      // Group slots by date
      const calendar = {};
      slots.forEach(slot => {
        const dateKey = slot.date.toISOString().split('T')[0];
        if (!calendar[dateKey]) {
          calendar[dateKey] = [];
        }
        calendar[dateKey].push({
          id: slot._id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          slot_duration: slot.slot_duration,
          status: slot.status,
          notes: slot.notes,
        });
      });

      return calendar;
    } catch (error) {
      console.error('Error in getCalendarView:', error);
      throw error;
    }
  }
}

export default new DoctorSlotsService();
