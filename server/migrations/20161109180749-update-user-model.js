'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return [
        queryInterface.addColumn(
            'Users',
            'isEmailVerified',{
                type: Sequelize.BOOLEAN,
                defaultValu : false,
                allowNull: false
            }
        ),
        queryInterface.addColumn(
          'Users',
          'authtoken',{
            type: Sequelize.String
        }),
        queryInterface.addColumn(
          'Users',
          'name',{
            type: Sequelize.String
        }),
        queryInterface.addColumn(
          'Users',
          'gender',{
            type:Sequelize.INTEGER
        }),
        queryInterface.addColumn(
          'Users',
          'accessLevel',{
            type:Sequelize.INTEGER
        })
      ];
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('Users', 'isEmailVerified'),
      queryInterface.removeColumn('Users', 'authtoken'),
      queryInterface.removeColumn('Users', 'name'),
      queryInterface.removeColumn('Users', 'gender'),
      queryInterface.removeColumn('Users', 'accessLevel')
  }
};
