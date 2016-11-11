'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.addColumn(
            'SocialMedia',
            'socialMediaType',{
                type: Sequelize.BOOLEAN,
                defaultValue : false,
                allowNull: false
            }
        )
  },

  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('Users', 'isEmailVerified'),
      queryInterface.removeColumn('Users', 'authtoken'),
      queryInterface.removeColumn('Users', 'name'),
      queryInterface.removeColumn('Users', 'gender'),
      queryInterface.removeColumn('Users', 'accessLevel')
  }
};
