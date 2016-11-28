'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
   queryInterface.changeColumn(
  'Brands',
  'brandPhone',
    {
        type: Sequelize.STRING
    })
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn(
  'Brands',
  'brandPhone',
    {
        type: Sequelize.INTEGER
    })
  }
};
