import Joi from 'joi';

/**
 * Schema for creating a new prescription
 */
export const createPrescriptionSchema = Joi.object({
  appointmentId: Joi.string().required().messages({
    'string.empty': 'Appointment ID is required',
    'any.required': 'Appointment ID is required',
  }),
  patientId: Joi.string().required().messages({
    'string.empty': 'Patient ID is required',
    'any.required': 'Patient ID is required',
  }),
  diagnosis: Joi.string().max(500).required().messages({
    'string.empty': 'Diagnosis is required',
    'string.max': 'Diagnosis cannot exceed 500 characters',
    'any.required': 'Diagnosis is required',
  }),
  notes: Joi.string().max(1000).allow('', null).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters',
  }),
  validTill: Joi.date().iso().min('now').required().messages({
    'date.base': 'Valid till must be a valid date',
    'date.min': 'Valid till date must be in the future',
    'any.required': 'Valid till date is required',
  }),
  medicines: Joi.array()
    .items(
      Joi.object({
        medicineId: Joi.string().required().messages({
          'string.empty': 'Medicine ID is required',
          'any.required': 'Medicine ID is required',
        }),
        medicineName: Joi.string().required().messages({
          'string.empty': 'Medicine name is required',
          'any.required': 'Medicine name is required',
        }),
        form: Joi.string()
          .valid('tablet', 'syrup', 'injection', 'inhaler', 'ointment')
          .required()
          .messages({
            'any.only':
              'Form must be one of: tablet, syrup, injection, inhaler, ointment',
            'any.required': 'Medicine form is required',
          }),
        dosage: Joi.string().required().messages({
          'string.empty': 'Dosage is required',
          'any.required': 'Dosage is required',
        }),
        frequency: Joi.string()
          .valid('once a day', 'twice a day', 'thrice a day', 'every 8 hours')
          .required()
          .messages({
            'any.only':
              'Frequency must be one of: once a day, twice a day, thrice a day, every 8 hours',
            'any.required': 'Frequency is required',
          }),
        durationDays: Joi.number().integer().min(1).required().messages({
          'number.base': 'Duration must be a number',
          'number.integer': 'Duration must be a whole number',
          'number.min': 'Duration must be at least 1 day',
          'any.required': 'Duration is required',
        }),
        quantityPrescribed: Joi.number().integer().min(1).required().messages({
          'number.base': 'Quantity must be a number',
          'number.integer': 'Quantity must be a whole number',
          'number.min': 'Quantity must be at least 1',
          'any.required': 'Quantity prescribed is required',
        }),
        instructions: Joi.string()
          .max(500)
          .allow('', null)
          .optional()
          .messages({
            'string.max': 'Instructions cannot exceed 500 characters',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one medicine must be prescribed',
      'any.required': 'Medicines list is required',
    }),
});

/**
 * Schema for updating an existing prescription
 */
export const updatePrescriptionSchema = Joi.object({
  diagnosis: Joi.string().max(500).optional().messages({
    'string.max': 'Diagnosis cannot exceed 500 characters',
  }),
  notes: Joi.string().max(1000).allow('', null).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters',
  }),
  validTill: Joi.date().iso().min('now').optional().messages({
    'date.base': 'Valid till must be a valid date',
    'date.min': 'Valid till date must be in the future',
  }),
  medicines: Joi.array()
    .items(
      Joi.object({
        medicineId: Joi.string().required().messages({
          'string.empty': 'Medicine ID is required',
          'any.required': 'Medicine ID is required',
        }),
        medicineName: Joi.string().required().messages({
          'string.empty': 'Medicine name is required',
          'any.required': 'Medicine name is required',
        }),
        form: Joi.string()
          .valid('tablet', 'syrup', 'injection', 'inhaler', 'ointment')
          .required()
          .messages({
            'any.only':
              'Form must be one of: tablet, syrup, injection, inhaler, ointment',
            'any.required': 'Medicine form is required',
          }),
        dosage: Joi.string().required().messages({
          'string.empty': 'Dosage is required',
          'any.required': 'Dosage is required',
        }),
        frequency: Joi.string()
          .valid('once a day', 'twice a day', 'thrice a day', 'every 8 hours')
          .required()
          .messages({
            'any.only':
              'Frequency must be one of: once a day, twice a day, thrice a day, every 8 hours',
            'any.required': 'Frequency is required',
          }),
        durationDays: Joi.number().integer().min(1).required().messages({
          'number.base': 'Duration must be a number',
          'number.integer': 'Duration must be a whole number',
          'number.min': 'Duration must be at least 1 day',
          'any.required': 'Duration is required',
        }),
        quantityPrescribed: Joi.number().integer().min(1).required().messages({
          'number.base': 'Quantity must be a number',
          'number.integer': 'Quantity must be a whole number',
          'number.min': 'Quantity must be at least 1',
          'any.required': 'Quantity prescribed is required',
        }),
        instructions: Joi.string()
          .max(500)
          .allow('', null)
          .optional()
          .messages({
            'string.max': 'Instructions cannot exceed 500 characters',
          }),
      })
    )
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one medicine must be prescribed',
    }),
  status: Joi.string()
    .valid('draft', 'finalized', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: draft, finalized, cancelled',
    }),
}).min(1);

/**
 * Schema for getting prescription by appointment ID (route params)
 */
export const getPrescriptionByAppointmentSchema = Joi.object({
  appointmentId: Joi.string().required().messages({
    'string.empty': 'Appointment ID is required',
    'any.required': 'Appointment ID is required',
  }),
});

/**
 * Schema for getting prescriptions by patient ID (route params)
 */
export const getPrescriptionsByPatientSchema = Joi.object({
  patientId: Joi.string().required().messages({
    'string.empty': 'Patient ID is required',
    'any.required': 'Patient ID is required',
  }),
});

/**
 * Schema for prescription ID in route params
 */
export const prescriptionIdSchema = Joi.object({
  prescriptionId: Joi.string().required().messages({
    'string.empty': 'Prescription ID is required',
    'any.required': 'Prescription ID is required',
  }),
});
