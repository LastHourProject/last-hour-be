const Joi = require('joi');

module.exports = {
  // GET /v1/flight/search
  search: {
    body: {
      origin: Joi.string().required(),
      destination: Joi.string().required(),
      departureDate: Joi.string().required(),
      adults: Joi.number().required(),
    },
  },
};
