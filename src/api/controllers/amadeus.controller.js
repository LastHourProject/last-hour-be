process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // remove after move to production

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
    // store body params
    const {
      origin, destination, departureDate, adults,
      includedAirlineCodes, returnDate, currencyCode,
      children, limit,
    } = req.body;
    // create payload for search
    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults,
      currencyCode,
    };
    // check if airlines codes available in body
    if (includedAirlineCodes) params.includedAirlineCodes = includedAirlineCodes.toString();
    // check if return date available in body
    if (returnDate) params.returnDate = returnDate;

    if (limit) params.max = limit;
    // check if children and their age exists
    if (children) {
      params.children = children;
    }
    // call for amadeus search api
    const response = await amadeus.shopping.flightOffersSearch.get(params);

    res.status(httpStatus.OK);
    return res.json({
      success: true,
      message: 'AMADEUS Flight Search Result.',
      data: response.data,
    });
  } catch (error) {
    console.error('Error during flight search => ', error);
    return next(error);
  }
};

/**
 * search for airpots.
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
      message: 'AMADEUS Airpots Search Result.',
      data: response.data,
    });
  } catch (error) {
    return next(error);
  }
};

exports.airlines = async (req, res, next) => {
  const { name, airlineCodes } = req.query;
  try {
    const response = await amadeus.referenceData.airlines.get({ airlineCodes });

    if (name && response.data.length) {
      const filterData = response.data.filter((item) => item.businessName.toLowerCase().includes(name.toLowerCase()));

      res.status(httpStatus.OK);
      return res.json({
        success: true,
        message: 'AMADEUS Airlines Search Result.',
        data: filterData,
      });
    }

    res.status(httpStatus.OK);
    return res.json({
      success: true,
      message: 'AMADEUS Airlines Search Result.',
      data: response.data,
    });
  } catch (error) {
    return next(error);
  }
};
