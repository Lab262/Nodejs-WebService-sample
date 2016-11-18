var express = require('express')
var router = express.Router()
var Environment = require('../../../config/environment')
var Jwt = require('jsonwebtoken')
var Mailer = require('../../../lib/mailer')
var errorHelper = require('../../../lib/error-handler')
var objectSerializer = require('../../../lib/object-serializer')
var models = require('../models/index');

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

        /* query param format
        email iLike ? OR email iLike ?,
        %smad%, 
        %th%
        */
    
        var pageVariables = objectSerializer.deserializeQueryPaginationIntoVariables(req)
            var totalLength = 0

            var queryDict = {
                where: req.query.where
            }
            if (pageVariables.limit != 0 || pageVariables.skip != 0) {
                queryDict = {
                    offset: pageVariables.skip,
                    limit: pageVariables.limit,
                    where: req.query.where
                }
            }

            return models.Brand.findAndCountAll(queryDict).then(function (result) {
                if (result.length < 1) {
                    return res.status(200).json({ data: [] });
                } else {
                    var serialized = objectSerializer.serializeObjectIntoJSONAPI(result.rows, result.count, pageVariables.limit)
                    return res.json(serialized)
                }
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                return res.status(403).json(error)
            })
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

        var deserializedBrand = null

        objectSerializer.deserializeJSONAPIDataIntoObject(req.body).then(function (deserialized) {

            deserializedBrand = deserialized

            return models.Brand.build(deserializedBrand).save().then(function (brand) {
                var serialized = objectSerializer.serializeObjectIntoJSONAPI(brand)
                return res.status(200).json(brand)
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                return res.status(403).json(error)
            })

        })
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

        models.Brand.update(
            objectSerializer.deserializerJSONAndCreateAUpdateClosure(req.body),
            {
                where: { id: req.params.id }
            })
            .then(function (result) {
               
                if (result == 0) {
                    var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("brand not found."))
                    console.log("RESULT 0")
                    return res.status(404).json(error)
                } else {
                    console.log("SUCCESS")
                    return res.status(200).json("Brand successfully updated")
                }
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                console.log("ERROR")
                return res.status(404).json(error)
            })
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

        models.Product.findOne({ where: { id: req.params.id } }).then(function (product) {

            if (product) {
                var serialized = objectSerializer.serializeObjectIntoJSONAPI(product)
                return res.json(serialized)
            } else {
                return res.status(404).json("PRODUCT NOT FOUND")
            }
        }).catch(function (err) {
            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(404).json(error)
        })
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

        models.Product.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (result) {

            if (result == 0) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("Product not found."))
                return res.status(404).json(error)
            } else {
                return res.status(200).json("Product successfully deleted")
            }
        }).catch(function (err) {
            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(404).json(error)
        })
    })

module.exports = router
