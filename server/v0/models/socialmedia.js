'use strict';
module.exports = function(sequelize, DataTypes) {
  var SocialMedia = sequelize.define('SocialMedia', {
    socialMediaId: DataTypes.STRING,
    socialMediaPassword: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    socialMediaType: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
         SocialMedia.belongsTo(models.User);
      }
    }
  });
  return SocialMedia;
};