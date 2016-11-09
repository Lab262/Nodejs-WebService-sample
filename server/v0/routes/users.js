var express = require('express')
var router = express.Router()
var Environment = require('../../../config/environment')
var Jwt = require('jsonwebtoken')
var Mailer = require('../../../lib/mailer')
var errorHelper= require('../../../lib/error-handler')
var objectSerializer = require('../../../lib/object-serializer')
var models = require('../models/index');

router.route('/users')

.get(function(req,res) {

  // var token = req.headers['x-access-token']
  // var decodedUser = Jwt.decode(token);

  // var pageVariables = objectSerializer.deserializeQueryPaginationIntoVariables(req)
  // var totalLength = 0

  // User.findOne({ _id: decodedUser.id}).exec().then(function(user) {
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

})

.post(function(req,res) {

    objectSerializer.deserializeJSONAPIDataIntoObject(req.body).then(function(deserialized) {
      models.User.findOne({ where: {email: deserialized.email} })
            console.log("teste") 
  }).then(function(user) {
          
          if (user != null && user !== undefined) {
              console.log(user)
              if (user.isEmailVerified) {
                console.log("verificou email") 
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Esse email já está em uso", "email")
              
                return res.status(403).json(error)
              } else {
                  console.log("passou antes do destroy") 
                  User.destroy({ where: {email:deserialized.email } }).then(function(){
                        errorHelper.errorHandler(err,req,res)
                      console.log(arguments) 
                      console.log("passou destroy") 
                })
              }
            }
                          console.log("antes de salvar")

            var newUser = new User(deserialized)
            newUser.save().then(function(err) {
              errorHelper.errorHandler(err,req,res)
               var tokenData = {
                  email: newUser.email,
                  id: newUser._id
                }
              console.log("entrou no salvar")
            })
           
           var token = Jwt.sign(tokenData,Environment.secret)

           Mailer.sentMailVerificationLink(newUser,token)

           var serialized = objectSerializer.serializeObjectIntoJSONAPI(newUser)

           return res.send({message: 'Por favor, confirme seu email clicando no link em seu email:' + newUser.email , user: serialized, token: token})
    }).then(function(err) {
      var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
      return res.status(403).json(error)
    })
  
  

  //           if (user !== null) {
  //             if (user.isEmailVerified) {
  //               var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Esse email já está em uso", "email")
  //               return res.status(403).json(error)
  //             } else {
  //               User.remove({email: deserialized.email}, function (err) {
  //                 errorHelper.errorHandler(err,req,res)
  //               })
  //             }
  //           }
  //           var newUser = new User(deserialized)
  //           newUser.save(function(err) {
  //             errorHelper.errorHandler(err,req,res)
  //             var tokenData = {
  //               email: newUser.email,
  //               id: newUser._id
  //             }

  //          var token = Jwt.sign(tokenData,Environment.secret)

  //          Mailer.sentMailVerificationLink(newUser,token)

  //          var serialized = objectSerializer.serializeObjectIntoJSONAPI(newUser)

  //          return res.send({message: 'Por favor, confirme seu email clicando no link em seu email:' + newUser.email , user: serialized, token: token})
  //      })
  //   })

})

router.route('/users/:id')

.patch(function(req,res) {

  // var callBack = function(deserialized) {
  //   User.findOne(
  //     {_id: req.params.id},
  //     function(err,user) {
  //       if(!user){
  //         errorHelper.entityNotFoundError(req,res)
  //       }

  //       var user =  objectSerializer.deserializerJSONIntoObject(user,deserialized)

  //       user.save(function(err,user) {

  //         return res.json({message: 'user successufully updated'})
  //       })
  //     })
  // }

  // objectSerializer.deserializeJSONAPIDataIntoObject(req.body,callBack)


  })

  .get(function(req,res) {
    // User.findOne({ _id: req.params.id},function(err,user) {
    //   errorHelper.errorHandler(err,req,res)
    //   var serialized = objectSerializer.serializeObjectIntoJSONAPI(user)

    //   return res.json(serialized)
    // })
  })

  .delete(function(req,res) {
    // User.remove({
    //   _id: req.params.id
    // },
    // function(err) {
    //   if (err) {
    //     errorHelper.erorHandler(err,req,res)
    //   } else {
    //     return res.status(204).json({message: 'user successufully deleted'})
    //   }
    // })
  })

module.exports = router
