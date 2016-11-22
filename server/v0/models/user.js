'use strict';



module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isEmailVerified: DataTypes.BOOLEAN,
    gender: DataTypes.INTEGER,
    accessLevel: DataTypes.INTEGER,
    name: DataTypes.STRING
    
  }, 
    {


// User = sequelize.define('User', {})
// Project = sequelize.define('Project', {})
// UserProjects = sequelize.define('UserProjects', {
//     status: DataTypes.STRING
// })
 
// User.belongsToMany(Project, { through: UserProjects })
// Project.belongsToMany(User, { through: UserProjects })
//       User.belongsToMany(Project, { as: 'Tasks', through: 'worker_tasks' })
// Project.belongsToMany(User, { as: 'Workers', through: 'worker_tasks' })
      classMethods: {
        associate: function (models) {
          User.hasMany(models.SocialMedia);
          User.belongsToMany(models.User, { as:});
        }
      },
      instanceMethods: {
        getTokenData: function() {
              var tokenData = {
          email: this.email,
          id: this.id
        }
          return tokenData
        }
      }
    });

  User.beforeCreate(function (user, options, next) {

          var jwtHelper = require('../../../lib/jwthelper')
          jwtHelper.encryptPasswords(user,"password",next)
 });

  return User;
};