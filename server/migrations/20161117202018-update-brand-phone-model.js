'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Brands', 'brand_phone', 'brandPhone')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Brands', 'brandPhone', 'brand_phone')
  }
};
