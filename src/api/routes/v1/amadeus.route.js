const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/amadeus.controller');
const { authorize } = require('../../middlewares/auth');
const { search } = require('../../validations/amadeus.validation');

const router = express.Router();

/**
 * Load user when API with search is hit
 */

router
  .route('/search')
  /**
   * @api {post} v1/search List Fights
   * @apiDescription Get a list of flights
   * @apiVersion 1.0.0
   * @apiName ListFlight
   * @apiGroup User
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1-}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
   * @apiParam  {String}             [name]       User's name
   * @apiParam  {String}             [email]      User's email
   * @apiParam  {String=user,admin}  [role]       User's role
   *
   * @apiSuccess {Object[]} users List of users.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .post(authorize(), validate(search), controller.search);

module.exports = router;
