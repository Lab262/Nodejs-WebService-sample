var express = require('express')
var router = express.Router()
var models = require('../models/index');

var ModelController = require('../../../lib/model-controller')
var modelController = new ModelController(models.Brand);

/**
 * @swagger
 * /api/v0/brands:
 *   get:
 *     tags:
 *       - Brands
 *     description: get all brands
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
 *         description: all brands.
 *       404:
 *         description: User not authorized.
 */
router.route('/brands')

    .get(function (req, res) {
               modelController.searchObjects(req, res)
        })

    /**
     * @swagger
     * /api/v0/brands:
     *   post:
     *     tags:
     *       - Brands
     *     description: Create new brand
     *     parameters:
    *       - name: name
    *         description: name brand
    *         in: formData
    *         required: true
    *         type: string
    *       - name: description
    *         description: description of brand
    *         in: formData
    *         required: true
    *         type: string
    *       - name: discount
    *         description: discount of brand, decimal separated by point "."
    *         in: formData
    *         required: false
    *         type: number
    *       - name: brand_phone
    *         description: brand of phone
    *         in: formData
    *         required: true
    *         type: integer
    *       - name: email
    *         description: email of brand
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
     *         description: brand object
     *       403:
     *         description: invalid paramer
     */
    .post(function (req, res) {
               modelController.createModel(req,res)
    })

/**
  * @swagger
  * /api/v0/brands/{id}:
  *   patch:
  *     tags:
  *       - Brands
  *     description: get brand and update by id
  *     parameters:
 *       - name: id
 *         description: brand valid id
 *         in: path
 *         required: true
 *         type: string
 *       - name: x-access-token
 *         description: access token user
 *         in: header
 *         required: true
 *         type: string
 *       - name: name
 *         description: name brand
 *         in: formData
 *         required: false
 *         type: string
 *       - name: description
 *         description: description brand
 *         in: formData
 *         required: false
 *         type: string
 *       - name: brandPhone
 *         description: brand phone
 *         in: formData
 *         required: false
 *         type: integer
 *       - name: discount
 *         description: brand discount
 *         in: formData
 *         required: false
 *         type: number
 *       - name: email
 *         description: brand email
 *         in: formData
 *         required: false
 *         type: string
  *     responses:
  *       200:
  *         description: Brand successfully updated.
  *       404:
  *         description: Brand not found.
  */
router.route('/brands/:id')

    .patch(function (req, res) {
               modelController.updateModel(req,res);
    })

    /**
     * @swagger
     * /api/v0/brands/{id}:
     *   get:
     *     tags:
     *       - Brands
     *     description: get brand by id
     *     parameters:
    *       - name: id
    *         description: brand valid id
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
     *         description: Brand informations.
     *       404:
     *         description: Brand not found.
     */
    .get(function (req, res) {
       modelController.searchOneWithId(req,res)
    })

    /**
     * @swagger
     * /api/v0/brands/{id}:
     *   delete:
     *     tags:
     *       - Brands
     *     description: delete brand by id
     *     parameters:
    *       - name: id
    *         description: brand valid id
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
     *         description: Brand successfully deleted.
     *       404:
     *         description: Brand not found.
     */
    .delete(function (req, res) {
        modelController.destroyOneWithId(req,res)
    })

module.exports = router
