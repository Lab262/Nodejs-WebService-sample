var express = require('express')
var router = express.Router()
var models = require('../models/index');

var ModelController = require('../../../lib/model-controller')
var modelController = new ModelController(models.Product);

/**
 * @swagger
 * /api/v0/products:
 *   get:
 *     tags:
 *       - Products
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
*         description: string regex for where query. Example___ name iLike '%camise%' OR description iLike  '%camise%' AND price < 10 OR name = Product
*         in: query
*         required: false
*         type: string
*       - name: includedAttributes
*         description: attributes to include in the response, separated by query
*         in: query
*         required: false
*         type: string
*       - name: order
*         description: string query of order separated by comma. Example___ NAME ASC, ID ASC
*         in: query
*         required: false
*         type: string
*       - name: x-access-token
*         description: access token user
*         in: header
*         required: true
*         type: string
 *     responses:
 *       200:
 *         description: all products.
 *       404:
 *         description: User not authorized.
 */
router.route('/products')

    .get(function (req, res) {
        modelController.searchObjects(req, res)
    })

    /**
     * @swagger
     * /api/v0/products:
     *   post:
     *     tags:
     *       - Products
     *     description: Create new product
     *     parameters:
    *       - name: name
    *         description: name product
    *         in: formData
    *         required: true
    *         type: string
    *       - name: price
    *         description: price product, decimal separated by point "."
    *         in: formData
    *         required: true
    *         type: number
    *       - name: description
    *         description: description of product
    *         in: formData
    *         required: true
    *         type: string
    *       - name: BrandId
    *         description: brand id
    *         in: formData
    *         required: true
    *         type: integer
    *       - name: discount
    *         description: discount of product, decimal separated by point "."
    *         in: formData
    *         required: false
    *         type: number
    *       - name: amount
    *         description: amount of product
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
     *         description: product object
     *       403:
     *         description: invalid paramer
     */
    .post(function (req, res) {
       modelController.createModel(req,res)
    })

/**
  * @swagger
  * /api/v0/products/{id}:
  *   patch:
  *     tags:
  *       - Products
  *     description: get product and update by id
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
 *       - name: name
 *         description: name product
 *         in: formData
 *         required: false
 *         type: string
 *       - name: description
 *         description: description product
 *         in: formData
 *         required: false
 *         type: string
 *       - name: price
 *         description: product price
 *         in: formData
 *         required: false
 *         type: number
 *       - name: discount
 *         description: product discount
 *         in: formData
 *         required: false
 *         type: number
 *       - name: amount
 *         description: product amount
 *         in: formData
 *         required: false
 *         type: integer
  *     responses:
  *       200:
  *         description: Product successfully updated.
  *       404:
  *         description: Product not found.
  */
router.route('/products/:id')

    .patch(function (req, res) {
        modelController.updateModel(req,res);
    })

    /**
     * @swagger
     * /api/v0/products/{id}:
     *   get:
     *     tags:
     *       - Products
     *     description: get product by id
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
     *         description: Product informations.
     *       404:
     *         description: Product not found.
     */
    .get(function (req, res) {
       modelController.searchOneWithId(req,res)
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
        modelController.destroyOneWithId(req,res)
    })

module.exports = router
