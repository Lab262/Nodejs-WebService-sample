


exports.setupSwagger = function (app, express) {

    var environment = require('./environment')
    var swaggerJSDoc = require('swagger-jsdoc');
    // swagger definition
    var swaggerDefinition = {
        info: {
            title: 'ohmybox API',
            version: '1.0.0',
            description: 'OhMyBox '
        },
        host: environment.server.host,
        basePath: '/'
    };
    // options for the swagger docs
    var options = {
        // import swaggerDefinitions
        swaggerDefinition: swaggerDefinition,
        // path to the API docs
        apis: ['./server/v0/routes/*.js'],
        url: "dasdsa"

    };
    // initialize swagger-jsdoc
    var swaggerSpec = swaggerJSDoc(options);


    app.get('/swagger.json', function (req, res) {
        // res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    var path = require('path')
    app.set('views', path.join('./', 'views'));
    app.set('view engine', 'jade');
    app.use(express.static(path.join('./', 'public')));


    let newHostUrl = "            url = " + `\"${environment.server.protocol}${environment.server.host}/swagger.json\"`;
    //replace the host of swagger ui
    var fs = require('fs');
    var data = fs.readFileSync('public/api-docs/index.html', 'utf-8');
    var lines = data.split('\n');
    // remove one line, starting at the first position
    lines.splice(43, 1, newHostUrl);
    // join the array back into a single string
    var newtext = lines.join('\n');
    var newValue = newtext;
    fs.writeFileSync('public/api-docs/index.html', newValue, 'utf-8');

}