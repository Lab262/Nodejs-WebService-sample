
exports.setupRoutesAndVersions = function(app) {
  var ROUTES = {
  
  'Users':'/users',
  'Authentications':'/authentications'}

  var VERSIONS = {'Pre-Production': '/v0'}

  for (var versionIndex in VERSIONS) {
    if (VERSIONS.hasOwnProperty(versionIndex)) {
      for (var currentRouteIndex in ROUTES) {
        if (ROUTES.hasOwnProperty(currentRouteIndex)) {

        app.use('/api' + VERSIONS[versionIndex], require('../routes' + VERSIONS[versionIndex] + ROUTES[currentRouteIndex]))
      }
    }
  }
}
}
//Router setup
