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

            return models.UserWishProduct.findAndCountAll(queryDict).then(function (result) {
                    var serialized = objectSerializer.serializeObjectIntoJSONAPI(result.rows, result.count, pageVariables.limit)
                    return res.json(serialized)
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                return res.status(403).json(error)
            })
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

        var deserializedUserWishProduct = null

        objectSerializer.deserializeJSONAPIDataIntoObject(req.body).then(function (deserialized) {

            deserializedUserWishProduct = deserialized

            return models.UserWishProduct.build(deserializedUserWishProduct).save().then(function (userWishProduct) {
                var serialized = objectSerializer.serializeObjectIntoJSONAPI(userWishProduct)
                return res.status(200).json(userWishProduct)
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                return res.status(403).json(error)
            })

        })
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

        models.UserWishProduct.update(
            objectSerializer.deserializerJSONAndCreateAUpdateClosure(req.body),
            {
                where: { id: req.params.id }
            })
            .then(function (result) {

                if (result == 0) {
                    var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("User Wish Product not found."))
                    return res.status(404).json(error)
                } else {
                    return res.status(200).json("User Wish Product successfully updated")
                }
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                return res.status(404).json(error)
            })
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

        models.UserWishProduct.findOne({ where: { id: req.params.id } }).then(function (userWishProduct) {

            if (userWishProduct) {
                var serialized = objectSerializer.serializeObjectIntoJSONAPI(userWishProduct)
                return res.json(serialized)
            } else {
                return res.status(404).json("USER WISH PRODUCT NOT FOUND")
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
