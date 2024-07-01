/* eslint-disable import/no-extraneous-dependencies */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const httpStatus = require('http-status');
const Amadeus = require('amadeus');
const { amadeusClientId, amadeusClientSecret } = require('../../config/vars');

const amadeus = new Amadeus({
  clientId: amadeusClientId,
  clientSecret: amadeusClientSecret,
});

/**
 * search for flights.
 * @public
 */
exports.search = async (req, res, next) => {
  try {
    const {
      origin, destination, departureDate, adults,
    } = req.body;
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
    });

    res.status(httpStatus.OK);
    return res.json({
      success: true,
      message: 'AMADEUS Flight Search Result.',
      data: response.data,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * search for airports.
 * @public
 */
exports.airports = async (req, res, next) => {
  try {
    const {
      keyword,
    } = req.query;
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT,CITY',
    });

    res.status(httpStatus.OK);
    return res.json({
      success: true,
      message: 'AMADEUS Airports Search Result.',
      data: response.data,
    });
  } catch (error) {
    return next(error);
  }
};
