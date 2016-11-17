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
*         description: regex for sequelize example _ email iLike ? OR email iLike ? \n %smad% \n %th% , each line represents a item in array. iLike %th%  means that will search all emails that contains the without consider the sensitive case. For each ? must have a parameter to corresponds like the %th% 
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
 *         description: all products.
 *       404:
 *         description: User not authorized.
 */
router.route('/users')

    .get(function (req, res) {

        /* query param format
        [email iLike ? OR email iLike ?,
        %smad%, 
        %th%]
        */

        var token = req.headers['x-access-token']
        var decodedProduct = Jwt.decode(token);

        var pageVariables = objectSerializer.deserializeQueryPaginationIntoVariables(req)
        var totalLength = 0

        models.Product.findOne({ where: { id: decodedProduct.id } }).then(function (product) {

            if (product === null) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("users not found"))
                return res.status(404).json(error)
            }
            if (user.accessLevel == 2) {

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

                return models.User.findAndCountAll(queryDict).then(function (result) {
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

            } else {
                return res.status(200).json(user)
            }
        })
    })

    //User.findOne({ _id: decodedUser.id}).exec().then(function(user) {
    //   if (user.isAdmin) {

    //     return User.count(req.query).exec()
    //   } else {

    //     var serialized = objectSerializer.serializeObjectIntoJSONAPI(users)
    //     return res.json(serialized)
    //   }

    // }).then(function(count) {

    //   totalLength = count

    //   if (totalLength > 0) {

    //     return User.find(req.query).skip(pageVariables.skip).limit(pageVariables.limit).sort({ isAdmin: 'descending'}).exec()
    //   } else {

    //     return res.status(200).json({data: []});
    //   }
    // }).then(function(users) {

    //   var serialized = objectSerializer.serializeObjectIntoJSONAPI(users, totalLength, pageVariables.limit)
    //   return res.json(serialized)
    // }).then(function(err) {

    //   var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
    //   return res.status(403).json(error)
    // })


    /**
     * @swagger
     * /api/v0/users:
     *   post:
     *     tags:
     *       - Users
     *     description: Create new user
     *     parameters:
    *       - name: isEmailVerified
    *         description: is email verified
    *         in: formData
    *         required: false
    *         type: boolean
    *       - name: email
    *         description: user valid email
    *         in: formData
    *         required: true
    *         type: string
    *       - name: password
    *         description: user password
    *         in: formData
    *         required: true
    *         type: string
    *       - name: accessLevel
    *         description: access level type options are 0 = user, 1 = seller, 2 = admin.
    *         in: formData
    *         required: true
    *         type: int
     *     responses:
     *       200:
     *         description: Por favor, confirme seu email clicando no link em seu email
     *       403:
     *         description: Por favor, confirme seu email clicando no link em seu email
     */
    .post(function (req, res) {

        var deserializedUser = null

        objectSerializer.deserializeJSONAPIDataIntoObject(req.body).then(function (deserialized) {

            deserializedUser = deserialized
            return models.User.findOne({ where: { email: deserialized.email } })

        }).then(function (user) {

            if (user != null && user !== undefined) {

                if (user.isEmailVerified) {

                    var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Email já está em uso", "email")
                    return res.status(403).json(error)

                } else {

                    user.destroy({
                        where: { email: user.email }
                    }).then(function () {
                    })
                }
            }

            return models.User.build(deserializedUser).save()

        }).then(function (newUser) {

            var tokenData = {
                email: newUser.email,
                id: newUser.id
            }
            var token = Jwt.sign(tokenData, Environment.secret)
            Mailer.sentMailVerificationLink(newUser, token)
            var serialized = objectSerializer.serializeObjectIntoJSONAPI(newUser)
            return res.json({ message: 'Por favor, confirme seu email clicando no link em seu email:' + newUser.email, user: serialized, token: token })

        }).catch(function (err) {

            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(403).json(error)
        })

    })

/**
  * @swagger
  * /api/v0/users/{id}:
  *   patch:
  *     tags:
  *       - Users
  *     description: get user and update by id
  *     parameters:
 *       - name: id
 *         description: user valid id
 *         in: path
 *         required: true
 *         type: string
 *       - name: x-access-token
 *         description: access token user
 *         in: header
 *         required: true
 *         type: string
 *       - name: email
 *         description: user email
 *         in: formData
 *         required: false
 *         type: string
 *       - name: name
 *         description: user name
 *         in: formData
 *         required: false
 *         type: string
 *       - name: gender
 *         description: user gender
 *         in: formData
 *         required: false
 *         type: string
 *       - name: accessLevel
 *         description: access level type options are 0 = user, 1 = seller, 2 = admin.
 *         in: formData
 *         required: false
 *         type: int
  *     responses:
  *       200:
  *         description: User successfully updated.
  *       404:
  *         description: User not found.
  */
router.route('/users/:id')

    .patch(function (req, res) {

        models.User.update(
            objectSerializer.deserializerJSONAndCreateAUpdateClosure(req.body),
            {
                where: { id: req.params.id }
            })
            .then(function (result) {

                if (result == 0) {
                    var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("user not found."))
                    return res.status(404).json(error)
                } else {
                    return res.status(200).json("User successfully updated")
                }
            }).catch(function (err) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
                return res.status(404).json(error)
            })
    })

    /**
     * @swagger
     * /api/v0/users/{id}:
     *   get:
     *     tags:
     *       - Users
     *     description: get user by id
     *     parameters:
    *       - name: id
    *         description: user valid id
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
     *         description: User informations.
     *       404:
     *         description: User not found.
     */
    .get(function (req, res) {

        models.User.findOne({ where: { id: req.params.id } }).then(function (user) {

            if (user) {
                var serialized = objectSerializer.serializeObjectIntoJSONAPI(user)
                return res.json(serialized)
            } else {
                return res.status(404).json("USER NOT FOUND")
            }
        }).catch(function (err) {
            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(404).json(error)
        })
    })

    /**
     * @swagger
     * /api/v0/users/{id}:
     *   delete:
     *     tags:
     *       - Users
     *     description: delete user by id
     *     parameters:
    *       - name: id
    *         description: user valid id
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
     *         description: User successfully deleted.
     *       404:
     *         description: User not found.
     */
    .delete(function (req, res) {

        models.User.destroy({
            where: {
                id: req.params.id
            }
        }).then(function (result) {

            if (result == 0) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("User not found."))
                return res.status(404).json(error)
            } else {
                return res.status(200).json("User successfully deleted")
            }
        }).catch(function (err) {
            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(404).json(error)
        })
    })

module.exports = router
