const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Category name is required'
  })
});

module.exports = {
  categorySchema
};
