
exports.setupRoutesAndVersions = function (app) {
  var ROUTES = {
    'Users': '/users',
    'Authentications': '/authentications',
    'Products': '/products',
    'Brands': '/brands',
    'UserWishProducts': '/userwishproducts',
    'UserHasBrand': '/userhasbrands'
  }

  var VERSIONS = { 'Pre-Production': '/v0' }

  for (var versionIndex in VERSIONS) {
    if (VERSIONS.hasOwnProperty(versionIndex)) {
      for (var currentRouteIndex in ROUTES) {
        if (ROUTES.hasOwnProperty(currentRouteIndex)) {

          app.use('/api' + VERSIONS[versionIndex], require('../server' + VERSIONS[versionIndex] + "/routes" + ROUTES[currentRouteIndex]))
        }
      }
    }
  }
}
//Router setup
