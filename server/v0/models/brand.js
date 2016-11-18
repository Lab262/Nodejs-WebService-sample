'use strict';
module.exports = function(sequelize, DataTypes) {
  var Brand = sequelize.define('Brand', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    discount: DataTypes.FLOAT,
    brandPhone: DataTypes.INTEGER,
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Brand.hasMany(models.Product);
      }
    }
  });
  return Brand;
};