'use strict';
module.exports = function(sequelize, DataTypes) {
  var Brand = sequelize.define('Brand', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    discount: DataTypes.FLOAT,
    brandPhone: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Brand.hasMany(models.Product);
        Brand.belongsToMany(models.User, {through: 'UserHasBrand'})     
      }
    }
  });
  return Brand;
};