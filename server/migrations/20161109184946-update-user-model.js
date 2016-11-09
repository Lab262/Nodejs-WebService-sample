'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

  return queryInterface.renameColumn('Users', 'authtoken', 'authToken')
  },

  down: function (queryInterface, Sequelize) {

  return queryInterface.renameColumn('Users', 'authToken', 'authtoken')
  }

};
