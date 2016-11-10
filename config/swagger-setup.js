

var environment = require('./environment') 

exports.setupSwagger = function (app) {
    
    var swaggerJSDoc = require('swagger-jsdoc');
    // swagger definition
    var swaggerDefinition = {
        info: {
            title: 'ohmybox API',
            version: '1.0.0',
            description: 'OhMyBox '
        },
        host: environment.server.protocol + environment.server.host,
        basePath: '/'
    };
    // options for the swagger docs
    var options = {
        // import swaggerDefinitions
        swaggerDefinition: swaggerDefinition,
        // path to the API docs
        apis: ['./server/v0/routes/*.js']
    };
    // initialize swagger-jsdoc
    var swaggerSpec = swaggerJSDoc(options);

    app.get('/swagger.json', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

}