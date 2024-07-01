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
