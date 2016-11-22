'use strict';
module.exports = function(sequelize, DataTypes) {
  var UserWishProduct = sequelize.define('UserWishProduct', {
    UserId: DataTypes.INTEGER,
    ProductId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return UserWishProduct;
};