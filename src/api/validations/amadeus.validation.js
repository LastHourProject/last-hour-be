const Joi = require('joi');

module.exports = {
  // POST /v1/flight/search
  search: {
    body: {
      origin: Joi.string().required(),
      destination: Joi.string().required(),
      departureDate: Joi.string().required(),
      adults: Joi.number().required(),
      includedAirlineCodes: Joi.array(),
      returnDate: Joi.string(),
      currencyCode: Joi.string().required(),
    },
  },

  // GET /v1/flight/airpots
  airports: {
    query: {
      keyword: Joi.string().required(),
    },
  },

  // GET /v1/flight/airlines
  airlines: {
    query: {
      airlineCodes: Joi.string(),
      name: Joi.string(),
    },
  },
};
