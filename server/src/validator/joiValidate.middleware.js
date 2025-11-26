import sendResponse from '../utils/sendResponse.js';

export const validate = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => d.message);
      return sendResponse(res, 400, 'Validation error', null, details);
    }
    next();
  };
};
