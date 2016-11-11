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
 * /api/v0/auth/facebook:
 *   post:
 *     tags:
 *      - Auth
 *     description: Login Social Media User 
 *     parameters:
*       - name: email
*         description: facebook email user
*         in: formData
*         required: true
*         type: string
*       - name: password
*         description: password secret with facebook id.
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
 *         description: User object
 *       403:
 *         description: email or password is wrong 
 *       422:
 *         description: User not found 
 */

router.route('/auth/facebook')
  .post(function (req, res) {

    
    if (req.body.email === null || req.body.password.password === null) {
      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Invalid facebook password format", "facebook.password")
      return res.status(403).json(error)

    }
    
    models.User.findOne({ where: { email: req.body.email } }).then(function (user) {
      // if (!user) {
        // var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Usuário não ", "password")
        //return res.status(403).json(error)
       return models.User.create({ email: req.body.email })
      // }
      }).then(function(user) {
          console.log("ENTROU NO NEW usER")
          user.email = req.body.facebook.email
          console.log("ENTROU NO NEW usER")
          var socialMedia = SocialMedia.create({
            userId: user.get('id'),
            socialMediaPassword: req.body.facebook.password,
            socialMediaType: 0
          });

          return socialMedia

        }).then(function (socialMedia) {
          //socialMedia.getUser()
          errorHelper.errorHandler(err, req, res)
          var token = Jwt.sign(newUser.tokenData, Environment.secret)

         // return res.json({ message: 'successufully create account throught facebook with email:' + newUser.email, user: newUser, token: token })
        }).catch(function (err) {
          console.log("ERRO:"+err)

      });
  })
// var newUser = new User(req.body)
// newUser.email = req.body.facebook.email
// newUser.save
// newUser.save = (function (err) {

// }

// User.findOne({ email : req.body.email }, function(err,user) {
//   //CREATE USER AND LOGIN

//   if (user === null) {
//     //return res.json("USUARIO NAO EXISTE")

//     var newUser = new User(req.body)
//     newUser.isEmailVerified = true
//     newUser.password = req.body.facebook.password
//     newUser.save(function(err) {
//       errorHelper.errorHandler(err,req,res)

//       var token = Jwt.sign(newUser.tokenData,Environment.secret)

//       return res.json({message: 'successufully create account throught facebook with email:' + newUser.email , user: newUser, token: token})
//     })
//   }else if (user.facebook === null || user.facebook.id === null) {
//     user.facebook.id = req.body.facebook.id
//     user.facebook.password = req.body.facebook.password
//     user.save(function(err) {
//       errorHelper.errorHandler(err,req,res)
//       var token = Jwt.sign(user.tokenData,Environment.secret)

//       return res.json({message: 'successufully associate account throught facebook with email:' + user.email , user: newUser, token: token})
//     })
//   } else {

//     JwtHelper.comparePassword(req.body.facebook.password, user.password, function(err, isMatch) {
//       if (err) {
//         var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação: senha incorreta", "password")
//         return res.status(422).json(error)
//       }
//       if (isMatch) {
//         var token = Jwt.sign(user.tokenData,Environment.secret)
//         return res.json({message: 'successufully logged throught facebook with email:' + user.email , user: user, token: token})
//       } else {
//         var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Falha na autenticação: senha incorreta", "password")
//         return res.status(422).json(error)
//       }
//     })
//   }

// })

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
