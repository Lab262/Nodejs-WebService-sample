'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    
    queryInterface.removeColumn('Users', 'authToken')

    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.addColumn(
          'Users',
          'authToken',{
            type: Sequelize.STRING
        })
  }
};
