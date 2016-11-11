var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var objectSerializer = require('./object-serializer')

exports.verifyJsonWebToken = function(req,res, next,app) {

   var token = req.headers['x-access-token']
   // decode token
   if (token) {
     // verifies secret and checks exp
     jwt.verify(token, app.get('superSecret'), function(err, decoded) {
       if (err) {
         var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Failed to authenticate token", "token")
         return res.status(401).json(error)
       } else {
      //    // if everything is good, save to request for use in other routes
         req.decoded = decoded
       }
     })

   } else {
     // if there is no token
     // return an error
     var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Missing json web token.", "token")
     return res.status(401).json(error)

   }

}

exports.comparePassword = function(candidatePassword,passwordToCompare, cb) {
    bcrypt.compare(candidatePassword, passwordToCompare, function(err, isMatch) {
        console.log(candidatePassword)
        console.log(passwordToCompare)
        console.log(isMatch)
        if (err) {
          return cb(err)
        }
        cb(null, isMatch)
    })
}

exports.encryptPasswords = function(modelObject,passwordPropertyName,next) {
 
           var SALT_WORK_FACTOR = 10
          var bcrypt = require('bcrypt')
          
          // only hash the password if it has been modified (or is new)
          if (!modelObject.changed(passwordPropertyName)) { return modelObject }

          console.log("use mUDOU PASSWORD")

          // generate a salt
          if (modelObject.changed(passwordPropertyName)) {
                      console.log("use mUDOU PASSWORd normal")

            bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
              if (err) { return sequelise.Promise.reject(err) }
                                    console.log("bcrypt gerou salt ")

              // hash the password along with our new salt
              bcrypt.hash(modelObject[passwordPropertyName], salt, function (err, hash) {
                
                if (err) { return sequelise.Promise.reject(err) }
                                                    
                // override the cleartext password with the hashed one
                modelObject[passwordPropertyName] = hash


                return next()
              })
            })
          }
          // else if (user.changed('facebook.password')) {
          //   console.log(user)
          //   bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
          //     if (err) { return next(err) }
          //     // hash the password along with our new salt
          //     bcrypt.hash(user.facebook.password, salt, function (err, hash) {
          //       if (err) { return next(err) }
          //       // override the cleartext password with the hashed one
          //       user.facebook.password = hash
          //       next()
          //     })
          //   })
          // } 
          else {
            return next()
          }
}