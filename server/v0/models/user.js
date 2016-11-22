'use strict';



module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isEmailVerified: DataTypes.BOOLEAN,
    gender: DataTypes.INTEGER,
    accessLevel: DataTypes.INTEGER,
    name: DataTypes.STRING
    
  },{
      classMethods: {
        associate: function (models) {
          User.hasMany(models.SocialMedia);
          User.belongsToMany(models.Product, {through: 'UserWishProduct'});      
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

          var jwtHelper = require('../../../lib/jwthelper')
          jwtHelper.encryptPasswords(user,"password",next)
 });

  return User;
};