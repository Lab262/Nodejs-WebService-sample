var objectSerializer = require('./object-serializer')


var ModelController = function (model) {


    let inflection = require('inflection');
    let pluralModelName = inflection.pluralize(model.name)
    
    this.model = model
    this.pluralModelName = pluralModelName
};

ModelController.prototype.searchObjects = function (req, res) {

    var query = 'SELECT (SELECT COUNT(*) AS count FROM "public"."' + this.pluralModelName
    query += '") AS count, '

    if (req.query.includedAttributes == undefined) {
        query += '*'
    } else {
        query += req.query.includedAttributes + ', id'
    }

    query += ' FROM "public"."' + this.pluralModelName + '"'

    if (req.query.where != undefined) {

        query += ' WHERE '
        query += req.query.where
    }

    if (req.query.order != undefined) {

        query += ' ORDER BY '
        query += req.query.order
    }

    var pageVariables = objectSerializer.deserializeQueryPaginationIntoVariables(req)

    if (pageVariables.limit != 0) {
        query += ' LIMIT ' + pageVariables.limit
    }

    if (pageVariables.skip != 0) {
        query += ' OFFSET ' + pageVariables.skip
    }

    var self = this 
    this.model.sequelize.query(query, { type: this.model.sequelize.QueryTypes.SELECT })
        .then(function (result) {

            var count = 0
            if (result[0] != null) {
                count = result[0].count
            }

            var serialized = objectSerializer.serializeObjectIntoJSONAPI(result, count, pageVariables, self.model.name)
            return res.status(200).json(serialized)

        }).catch(function (err) {

            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(403).json(error)
        })

}

module.exports = ModelController