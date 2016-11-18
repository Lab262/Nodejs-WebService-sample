'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
            'Products',
            'BrandId',{
                type: Sequelize.INTEGER
            })
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Products', 'BrandId')
  }
};
