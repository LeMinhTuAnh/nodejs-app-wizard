const Ajv = require('ajv');
const createError = require('http-errors');

module.exports = schema => async (ctx, next) => {
  try {
    // validate request body
    const ajv = new Ajv({
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
      verbose: true,
      errorDataPath: 'property',
    });

    const valid = ajv
      .addSchema(schema, 'bodySchema')
      .validate('bodySchema', ctx.request.body);

    if (!valid) {
      throw createError(422, 'validation error', {
        errors: ajv.errors.map(err => ({
          code: 422,
          message: `${err.dataPath.slice(1)} ${err.message}`,
        })),
      });
    }

    await next();
  } catch (error) {
    ctx.throw(error);
  }
};
