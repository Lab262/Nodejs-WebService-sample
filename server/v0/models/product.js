'use strict';
module.exports = function(sequelize, DataTypes) {
  var Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    description: DataTypes.STRING,
    discount: DataTypes.FLOAT,
    amount: DataTypes.INTEGER,
    BrandId: DataTypes.INTEGER

  }, {
    classMethods: {
      associate: function(models) {
        Product.belongsTo(models.Brand);
        Product.belongsToMany(models.User, {through: 'UserWishProduct'}); 
      }
    }
  });
  return Product;
};
