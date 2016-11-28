'use strict';
module.exports = function(sequelize, DataTypes) {
  var UserHasBrand = sequelize.define('UserHasBrand', {
    UserId: DataTypes.STRING,
    BrandId: DataTypes.STRING,
    userAccessLevel: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        UserHasBrand.belongsTo(models.User)
        UserHasBrand.belongsTo(models.Brand)
      }
    }
  });
  return UserHasBrand;
};