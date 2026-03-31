const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Product name is required'
  }),
  category: Joi.string().required().messages({
    'string.empty': 'Category is required'
  }),
  description: Joi.string().trim().allow(''), 
});

module.exports = {
  productSchema
};
