'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return  queryInterface.addColumn(
            'SocialMedia',
            'socialMediaType',{
                type: Sequelize.INTEGER,
                allowNull: false,
            })
  },
  down: function (queryInterface, Sequelize) {
      queryInterface.removeColumn('SocialMedia', 'isEmailVerified')
  }
};
