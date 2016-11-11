var express = require('express')
var router = express.Router()
var Environment = require('../../../config/environment')
var Jwt = require('jsonwebtoken')
var JwtHelper = require('../../../lib/jwthelper')
var Mailer = require('../../../lib/mailer')
var PasswordGenerator = require('password-generator')
var errorHelper = require('../../../lib/error-handler')
var objectSerializer = require('../../../lib/object-serializer')
var models = require('../models/index');


/**
 * @swagger
 * /api/v0/auth/login:
 *   post:
 *     tags:
 *      - Auth
 *     description: Login User 
 *     parameters:
*       - name: email
*         description: email user
*         in: formData
*         required: true
*         type: string
*       - name: password
*         description: user  password
*         in: formData
*         required: true
*         type: string
 *     responses:
 *       200:
 *         description: User object
 *       403:
 *         description: email or password is wrong 
 *       422:
 *         description: User not found 
 */
router.route('/auth/login')
  .post(function (req, res) {

    verifyUserAndConfirmMailVerification(req, res, function (user) {
      authenticateUser(req, res, user)
    })

  })

/**
 * @swagger
 * /api/v0/auth/verifyEmail/{token}:
 *   get:
 *     tags:
 *       - Auth
 *     description: Verication email
 *     parameters:
*       - name: token
*         description: email verification token 
*         in: path 
*         required: true
*         type: string
 *     responses:
 *       200:
 *         description: User object
 *       403:
 *         description: email or password is wrong 
 *       422:
 *         description: User not found 
 */
router.route('/auth/verifyEmail/:token')
  .get(function (req, res) {

    Jwt.verify(req.params.token, Environment.secret, function (err, decoded) {

      if (decoded === undefined || err !== null) {
        var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Link de verificação inválida.", "email")
        return res.status(403).json(error)
      }
      console.log({ id: decoded.id })

      models.User.findOne({ where: { id: decoded.id, email: decoded.email } }).then(function (user) {

        if (user === null) {
          var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Link de vericação inválida.", "email")

          return res.status(403).json(error)
        } else if (user.isEmailVerified === true) {

          var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Email já verificado", "email")
          return res.status(403).json(error)
        }

        user.isEmailVerified = true
        return user.save()
      }).then(function () {

        return res.status(200).json({ message: 'Email Verificado com sucesso' })

      }).catch(function (err) {
        var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(err)
        return res.status(403).json(error)
      })
    })
  })

/**
 * @swagger
 * /api/v0/auth/forgotPassword:
 *   post:
 *     tags:
 *      - Auth
 *     description: Forgot Password 
 *     parameters:
*       - name: email
*         description: email user
*         in: formData
*         required: true
*         type: string
 *     responses:
 *       200:
 *         description: User object
 *       403:
 *         description: email or password is wrong 
 *       422:
 *         description: User not found 
 */

router.route('/auth/forgotPassword')
  .post(function (req, res) {

    models.User.findOne({ where: { email: req.body.email } }).then(function (user) {
      if (!user) {
        var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Email não registrado", "email")
        return res.status(422).json(error)
      }
      if (!user.isEmailVerified) {
        var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Seu email ainda não foi verificado, por favor verifique seu email para continuar", "email")
        return res.status(403).json(error)
      } else {

        var token = Jwt.sign(user.getTokenData(), Environment.secret)

        Mailer.sentMailForgotPasswordLink(user, token)

        return res.json({ message: "A senha foi enviada para o email cadastrado: " + req.body.email })
      }
    }).catch(function (err) {
      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(err)
      return res.status(403).json(error)
    })
  })

/**
 * @swagger
 * /api/v0/auth/forgotPasswordConfirmed/{token}:
 *   get:
 *     tags:
 *       - Auth
 *     description: Confirm forgot link.
 *     parameters:
*       - name: token
*         description: email verification token 
*         in: path 
*         required: true
*         type: string
 *     responses:
 *       200:
 *         description: A nova senha foi enviada para o email.
 *       403:
 *         description: Link de renovação inválido. 
 */
router.route('/auth/forgotPasswordConfirmed/:token')
  .get(function (req, res) {

    // return res.json(req.params.token)
    var userObject = null
    Jwt.verify(req.params.token, Environment.secret, function (err, decoded) {
      if (decoded === undefined) {
        var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Link de verificação inválida.", "password")
        return res.status(403).json(error)
      }

      models.User.findOne({ where: { email: decoded.email } }).then(function (user) {
        if (!user) {
          var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Link de renovação inválido", "password")
          return res.status(403).json(error)
        }

        var random = PasswordGenerator(12, false)
        user.password = random
        userObject = user

        Mailer.sentNewCredentials(user, random)

        return user.save()
      }).then(function () {

        return res.status(200).json({ message: 'A nova senha foi enviada para o email ' + userObject.email })

      }).catch(function (err) {
        var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(err)
        return res.status(403).json(error)
      })

    })

  })

/**
 * @swagger
 * /api/v0/auth/socialMedia:
 *   post:
 *     tags:
 *      - Auth
 *     description: Login Social Media User.
 *     parameters:
*       - name: email
*         description: social media email user
*         in: formData
*         required: true
*         type: string
*       - name: password
*         description: password secret with social media id.
*         in: formData
*         required: true
*         type: string
*       - name: socialMediaType
*         description: social media type options are 0 = Facebook, 1 = Instagram, 2 = Gmail, 3 = Twitter.
*         in: formData
*         required: true
*         type: string
*       - name: socialMediaId
*         description: social media id.
*         in: formData
*         required: true
*         type: string
 *     responses:
 *       200:
 *         description: successufully logged throught facebook with email.
 *       423:
 *         description: Falha na autenticação senha incorreta. 
 */

router.route('/auth/socialMedia')
  .post(function (req, res) {


    if (req.body.email === null || req.body.password === null || req.body.password.indexOf(Environment.facebook.passwordSecret) < 0) {
      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Invalid facebook password format", "facebook.password")
      return res.status(403).json(error)
    }

    var foundUser = null
    models.User.findOne({ where: { email: req.body.email, isEmailVerified: true } }).then(function (user) {
      if (!user) {

        return models.User.create({
          email: req.body.email,
          password: req.body.password,
          isEmailVerified: true,
          SocialMedia: [{
            socialMediaPassword: req.body.password,
            socialMediaType: req.body.socialMediaType,
            socialMediaId: req.body.socialMediaId
          }]
        }, {
            include: [models.SocialMedia]
          })

      }
      foundUser = user

      return user.getSocialMedia({ where: { socialMediaType: req.body.socialMediaType } }).then(function (socialMedia) {

        if (socialMedia.length === 0) {

          return models.SocialMedia.create({
            socialMediaId: req.body.socialMediaId,
            socialMediaType: req.body.socialMediaType,
            socialMediaPassword: req.body.password
          }).then(function (socialMedia) {

            return foundUser.addSocialMedia(socialMedia)
          })
        } else {

          JwtHelper.comparePassword(req.body.password, socialMedia[0].socialMediaPassword, function (err, isMatch) {
            if (err) {
              var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação: senha incorreta", "password")
              return res.status(422).json(error)
            }
            if (isMatch) {
              var token = Jwt.sign(foundUser.getTokenData(), Environment.secret)
              return res.status(200).json({ message: 'successufully logged throught facebook with email:' + foundUser.email, user: foundUser, token: token })
            } else {
              var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação: senha incorreta", "password")
              return res.status(422).json(error)
            }
          })
        }

      })

    }).then(function (newUser) {
      var token = Jwt.sign(newUser.getTokenData(), Environment.secret)
      return res.status(200).json({ message: 'successufully logged with account throught facebook with email:' + newUser.email, user: newUser, token: token })
    }).catch(function (err) {
      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação: senha incorreta", "password")
      return res.status(422).json(error)
    });
  })

function verifyUserAndConfirmMailVerification(req, res, callbackAfterVerification) {

  models.User.findOne({ where: { email: req.body.email } }).then(function (user) {
    if (!user) {
      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação. Usuário não encontrado.", "email")
      return res.status(422).json(error)
    }

    if (!user.isEmailVerified) {
      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Seu email ainda não foi verificado, por favor verifique seu email para continuar", "email")
      return res.status(403).json(error)
    } else {
      callbackAfterVerification(user)
    }
  }).catch(function (err) {
    var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(err)
    return res.status(403).json(error)
  })

}

function authenticateUser(req, res, user) {

  JwtHelper.comparePassword(req.body.password, user.password, function (err, isMatch) {
    if (err) {

      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação: senha Incorreta", "password")
      return res.status(422).json(error)

    } if (isMatch) {

      var result = {
        token: Jwt.sign(user.getTokenData(), Environment.secret),
        user: user
      }


      return res.json(result)
    } else {

      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação: senha Incorreta", "password")
      return res.status(422).json(error)
    }
  })
}

module.exports = router
