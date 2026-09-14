const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

// validate req body, query and params against a zod schema so controllers can trust their shape
const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.query) req.query = schema.query.parse(req.query);
    if (schema.params) req.params = schema.params.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    next(err);
  }
};

module.exports = validate;