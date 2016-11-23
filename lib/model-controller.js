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

ModelController.prototype.searchOneWithId = function (req, res) {

    let query = 'SELECT * FROM "public"."' + this.pluralModelName + '" WHERE id = ' + req.params.id + " LIMIT 1"

    var self = this
    this.model.sequelize.query(query, { type: this.model.sequelize.QueryTypes.SELECT })
        .then(function (result) {

            if (result.length > 0) {
                let serialized = objectSerializer.serializeObjectIntoJSONAPI(result, 1, 1, self.model.name)
                return res.status(200).json(serialized)
            } else {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Model not found")
                return res.status(404).json(error)

            }

        }).catch(function (err) {

            let error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(403).json(error)
        })
}

ModelController.prototype.destroyOneWithId = function (req, res) {

    // 'WITH deleted AS (DELETE FROM table WHERE condition IS TRUE RETURNING *) SELECT count(*) FROM deleted;'

    let query = 'DELETE FROM "public"."' + this.pluralModelName + '" WHERE id = ' + req.params.id + " RETURNING *"

    var self = this
    this.model.sequelize.query(query, { type: this.model.sequelize.QueryTypes.DELETE })
        .then(function (result) {

            if (result.length == 0) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI("Model not found.")
                return res.status(404).json(error)
            } else {
                return res.status(200).json({ msg: "Model successfully deleted" })
            }

        }).catch(function (err) {

            let error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(403).json(error)
        })

}

ModelController.prototype.createModel = function (req, res) {

    var deserializedModel = null

    let self = this
    objectSerializer.deserializeJSONAPIDataIntoObject(req.body).then(function (deserialized) {

        deserializedModel = deserialized

        return self.model.build(deserializedModel).save().then(function (newModel) {
            var serialized = objectSerializer.serializeObjectIntoJSONAPI(newModel)
            return res.status(200).json(serialized)
        }).catch(function (err) {
            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(403).json(error)
        })

    })
}

ModelController.prototype.updateModel = function (req, res) {

    this.model.update(
        objectSerializer.deserializerJSONAndCreateAUpdateClosure(req.body),
        {
            where: { id: req.params.id }
        })
        .then(function (result) {

            if (result == 0) {
                var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify("model not found."))
                return res.status(404).json(error)
            } else {
                return res.status(200).json("Model successfully updated")
            }
        }).catch(function (err) {
            var error = objectSerializer.serializeSimpleErrorIntoJSONAPI(JSON.stringify(err))
            return res.status(404).json(error)
        })
}

module.exports = ModelController