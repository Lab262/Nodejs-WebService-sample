var express = require('express')
var router = express.Router()
var models = require('../models/index');

var ModelController = require('../../../lib/model-controller')
var modelController = new ModelController(models.UserWishProduct);

/**
 * @swagger
 * /api/v0/userwishproducts:
 *   get:
 *     tags:
 *       - UserWishProducts
 *     description: get all products
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
 *         description: all user wish products by query.
 *       404:
 *         description: User not authorized.
 */
router.route('/userwishproducts')

    .get(function (req, res) {
        modelController.searchObjects(req, res)
    })

    /**
     * @swagger
     * /api/v0/userwishproducts:
     *   post:
     *     tags:
     *       - UserWishProducts
     *     description: Create new user wish product
     *     parameters:
    *       - name: UserId
    *         description: user id 
    *         in: formData
    *         required: true
    *         type: string
    *       - name: ProductId
    *         description: product id
    *         in: formData
    *         required: true
    *         type: string
    *       - name: x-access-token
    *         description: access token user
    *         in: header
    *         required: true
    *         type: string
     *     responses:
     *       200:
     *         description: user wish product object
     *       403:
     *         description: invalid paramer
     */
    .post(function (req, res) {
        modelController.createModel(req, res)
    })

/**
  * @swagger
  * /api/v0/userwishproducts/{id}:
  *   patch:
  *     tags:
  *       - UserWishProducts
  *     description: get user wish products and update by id
  *     parameters:
 *       - name: id
 *         description: user wish product valid id
 *         in: path
 *         required: true
 *         type: string
 *       - name: x-access-token
 *         description: access token user
 *         in: header
 *         required: true
 *         type: string
 *       - name: UserId
 *         description: user id 
 *         in: formData
 *         required: false
 *         type: string
 *       - name: ProductId
 *         description: product id
 *         in: formData
 *         required: false
 *         type: string
  *     responses:
  *       200:
  *         description: User wish product successfully updated.
  *       404:
  *         description: User wish product not found.
  */
router.route('/userwishproducts/:id')

    .patch(function (req, res) {
        modelController.updateModel(req, res);
    })

    /**
     * @swagger
     * /api/v0/userwishproducts/{id}:
     *   get:
     *     tags:
     *       - UserWishProducts
     *     description: get user wish products by id
     *     parameters:
    *       - name: id
    *         description: user wish product valid id
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
     *         description: User wish products informations.
     *       404:
     *         description: User wish products not found.
     */
    .get(function (req, res) {
        modelController.searchOneWithId(req, res)
    })

    /**
     * @swagger
     * /api/v0/products/{id}:
     *   delete:
     *     tags:
     *       - Products
     *     description: delete product by id
     *     parameters:
    *       - name: id
    *         description: product valid id
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
     *         description: Product successfully deleted.
     *       404:
     *         description: Product not found.
     */
    .delete(function (req, res) {
        modelController.destroyOneWithId(req, res)
    })

module.exports = router
