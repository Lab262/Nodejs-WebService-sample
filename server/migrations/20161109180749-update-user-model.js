'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return [
        queryInterface.addColumn(
            'users',
            'isEmailVerified',{
                type: Sequelize.BOOLEAN,
                defaultValu : false,
                allowNull: false
            }
        ),
        queryInterface.addColumn(
          'users',
          'authtoken',{
            type: Sequelize.String
        }),
        queryInterface.addColumn(
          'users',
          'name',{
            type: Sequelize.String
        }),
        queryInterface.addColumn(
          'users',
          'gender',{
            type:Sequelize.INTEGER
        }),
        queryInterface.addColumn(
          'users',
          'accessLevel',{
            type:Sequelize.INTEGER
        })
      ];
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('users', 'isEmailVerified'),
      queryInterface.removeColumn('users', 'authtoken'),
      queryInterface.removeColumn('users', 'name'),
      queryInterface.removeColumn('users', 'gender'),
      queryInterface.removeColumn('users', 'accessLevel')
  }
};
