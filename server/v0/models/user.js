'use strict';



module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isEmailVerified: DataTypes.BOOLEAN,
    gender: DataTypes.INTEGER,
    accessLevel: DataTypes.INTEGER,
    name: DataTypes.STRING
    
  }, 
    {
      classMethods: {
        associate: function (models) {
          User.hasMany(models.SocialMedia);
        }
      },
      instanceMethods: {
        getTokenData: function() {
              var tokenData = {
          email: this.email,
          id: this.id
        }
          return tokenData
        }
      }
    });

  User.beforeCreate(function (user, options, next) {
         
          var SALT_WORK_FACTOR = 10
          var bcrypt = require('bcrypt')

          // only hash the password if it has been modified (or is new)
          // if (!user.changed('password') && !user.changed('facebook.password')) { return next() }
          if (!user.changed('password')) { return user }

          console.log("use mUDOU PASSWORD")

          // generate a salt
          if (user.changed('password')) {
                      console.log("use mUDOU PASSWORd normal")

            bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
              if (err) { return sequelise.Promise.reject(err) }
                                    console.log("bcrypt gerou salt ")

              // hash the password along with our new salt
              bcrypt.hash(user.password, salt, function (err, hash) {
                
                if (err) { return sequelise.Promise.reject(err) }
                                                    
                // override the cleartext password with the hashed one
                console.log(user)
                user.password = hash
                                console.log(user)
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
        });

  return User;
};