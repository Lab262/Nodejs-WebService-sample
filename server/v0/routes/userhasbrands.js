var express = require('express')
var router = express.Router()
var models = require('../models/index');

var ModelController = require('../../../lib/model-controller')
var modelController = new ModelController(models.UserHasBrand);

/**
 * @swagger
 * /api/v0/userhasbrands:
 *   get:
 *     tags:
 *       - UserHasBrands
 *     description: get all userhasbrands
 *     parameters:
*       - name: page
*         description: number of pages
*         in: query
*         required: false
*         type: integer
*       - name: limit
*         description: skip number
*         in: query
*         required: false
*         type: integer
*       - name: where
*         description: regex for sequelize example _ name iLike ? OR description iLike ? \n %camise% \n %vermelha% , each line represents a item in array. iLike %camise%  means that will search all emails that contains the without consider the sensitive case. For each ? must have a parameter to corresponds like the %camise% 
*         in: query
*         required: false
*         type: array
*         collectionFormat: multi
*       - name: x-access-token
*         description: access token user
*         in: header
*         required: true
*         type: string
 *     responses:
 *       200:
 *         description: all userhasbrands wish products by query.
 *       404:
 *         description: UserHasBrand not authorized.
 */
router.route('/userhasbrands')

    .get(function (req, res) {
        modelController.searchObjects(req, res)
    })

    /**
     * @swagger
     * /api/v0/userhasbrands:
     *   post:
     *     tags:
     *       - UserHasBrands
     *     description: Create new userhasbrand
     *     parameters:
    *       - name: BrandId
    *         description: the BrandId 
    *         in: formData
    *         required: true
    *         type: integer
    *       - name: UserId 
    *         description: the user id 
    *         in: formData
    *         required: true
    *         type: integer
    *       - name: userAccessLevel 
    *         description: the user access level. 0..brandAdmin 
    *         in: formData
    *         required: true
    *         type: integer
    *       - name: x-access-token
    *         description: access token user
    *         in: header
    *         required: true
    *         type: string
     *     responses:
     *       200:
     *         description: userhasbrand
     *       403:
     *         description: invalid paramer
     */
    .post(function (req, res) {
        modelController.createModel(req, res)
    })


router.route('/userwishproducts/:id')


/**
  * @swagger
  * /api/v0/userhasbrands/{id}:
  *   patch:
  *     tags:
  *       - UserHasBrands
  *     description: get user userhasbrands and update by id
  *     parameters:
 *       - name: BrandId
 *         description: the BrandId 
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: UserId 
 *         description: the user id 
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: userAccessLevel 
 *         description: the user access level. 0..brandAdmin 
 *         in: formData
 *         required: true
 *         type: integer
 *       - name: x-access-token
 *         description: access token user
 *         in: header
 *         required: true
 *         type: string
  *     responses:
  *       200:
  *         description: userhasbrands successfully updated.
  *       404:
  *         description: userhasbrands not found.
  */
    .patch(function (req, res) {
        modelController.updateModel(req, res);
    })

    /**
     * @swagger
     * /api/v0/userhasbrands/{id}:
     *   get:
     *     tags:
     *       - UserHasBrands
     *     description: get userhasbrand by id
     *     parameters:
    *       - name: id
    *         description: userhasbrand valid id
    *         in: path
    *         required: true
    *         type: integer
    *       - name: x-access-token
    *         description: access token user
    *         in: header
    *         required: true
    *         type: string
     *     responses:
     *       200:
     *         description: userhasbrand informations.
     *       404:
     *         description: userhasbrand not found.
     */
    .get(function (req, res) {
        modelController.searchOneWithId(req, res)
    })

    /**
     * @swagger
     * /api/v0/userhasbrands/{id}:
     *   delete:
     *     tags:
     *       - UserHasBrands
     *     description: delete userhasbrand  by id
     *     parameters:
    *       - name: id
    *         description: userhasbrand  valid id
    *         in: path
    *         required: true
    *         type: string
    *       - name: x-access-token
    *         description: access token user
    *         in: header
    *         required: true
    *         type: string
     *     responses:
     *       200:
     *         description: userhasbrand  successfully deleted.
     *       404:
     *         description: userhasbrand  not found.
     */
    .delete(function (req, res) {
        modelController.destroyOneWithId(req, res)
    })

module.exports = router
