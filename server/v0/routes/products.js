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
*       - name: include
*         description: array of attributes for include
*         in: query
*         required: false
*         type: array
*         collectionFormat: multi
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

        /* query param format
        email iLike ? OR email iLike ?,
        %smad%, 
        %th%
        */    

        // if (req.query.include != undefined) {
        //     if (Object.prototype.toString.call(req.query.include) === '[object Array]') {
        //         queryDict = {
        //             attributes: req.query.include
        //         }
        //     } else if (typeof req.query.include === "string" || req.query.include instanceof String) {
        //         queryDict = {
        //             attributes: [req.query.include]
        //         }
        //     }
        // }

        // if (req.query.order != undefined) {

        //     var orderOptionsArray = []
        //     if (Object.prototype.toString.call(req.query.order) === '[object Array]') {
        //         for (i = 0, len = req.query.order.length; i < len; i++) {
        //             orderOptionsArray[i] = req.query.order[i].split(" ")
        //         }
        //     } else if (typeof req.query.order === "string" || req.query.order instanceof String) {
        //         orderOptionsArray = [req.query.order.split(" ")]
        //     }
        //     queryDict = {
        //         order: orderOptionsArray
        //     }
        // }




        var query = 'SELECT (SELECT COUNT(*) AS count FROM "public"."Products") AS count, * FROM "public"."Products"'

         if (req.query.where != undefined) { 

             query += ' WHERE '
             query += req.query.where
         }
        
         if (req.query.order != undefined) { 

             query += ' ORDER BY '
             query += req.query.order
         }
         
         

        var pageVariables = objectSerializer.deserializeQueryPaginationIntoVariables(req)

         if (pageVariables.limit != 0) {
             query += ' LIMIT ' + pageVariables.limit 
         }

          if (pageVariables.skip != 0) {
             query += ' OFFSET ' + pageVariables.skip 
         }
         
        models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT})
        .then(function(result) {

            var count = 0
            if (result[0] != null) {
                count = result[0].count
            }

            var serialized = objectSerializer.serializeObjectIntoJSONAPI(result, count,  pageVariables,'Product')
            return res.status(200).json(serialized)

        }).catch(function (err) {

            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(403).json(error)
        })

    //     return models.Product.findAndCountAll().then(function (result) {

    //         var serialized = objectSerializer.serializeObjectIntoJSONAPI(result.rows, result.count, pageVariables.limit)
    //         return res.json(serialized)

    //     }).catch(function (err) {

    //         var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
    //         return res.status(403).json(error)
    //     })
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

        var deserializedProduct = null

        objectSerializer.deserializeJSONAPIDataIntoObject(req.body).then(function (deserialized) {

            deserializedProduct = deserialized

            return models.Product.build(deserializedProduct).save().then(function (product) {
                var serialized = objectSerializer.serializeObjectIntoJSONAPI(product)
                return res.status(200).json(product)
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                return res.status(403).json(error)
            })

        })
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

        models.Product.update(
            objectSerializer.deserializerJSONAndCreateAUpdateClosure(req.body),
            {
                where: { id: req.params.id }
            })
            .then(function (result) {

                if (result == 0) {
                    var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("product not found."))
                    return res.status(404).json(error)
                } else {
                    return res.status(200).json("Product successfully updated")
                }
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
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
