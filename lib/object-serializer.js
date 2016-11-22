exports.deserializerJSONIntoObject = function (object, jsonBody) {
  for (var param in jsonBody) {
    if (jsonBody.hasOwnProperty(param)) {
      if (param in object) {
        object[param] = jsonBody[param]
      }
    }
  }
  return object
}

exports.deserializerJSONAndCreateAUpdateClosure = function (jsonBody) {
    if (Object.keys(jsonBody).indexOf("data") == -1) {
        return jsonBody
  } else {
    return jsonBody.data.attributes
  }
}

exports.serializeObjectIntoJSONAPI = function (object, totalLength, limit) {

  var JSONAPISerializer = require('jsonapi-serializer').Serializer;

  var emptyDataReturn = {
    "data": [
    ]
  }

  if (Object.prototype.toString.call(object) === '[object Array]') {
    if (object[0] == null) { return emptyDataReturn }
    var objectAttributes = Object.keys(object[0].dataValues);
    var objectType = object[0]['$modelOptions']['name']['singular']
  } else {
    if (object == null) { return emptyDataReturn }
    var objectAttributes = Object.keys(object.dataValues);
    var objectType = object['$modelOptions']['name']['singular']
  }

  var ObjectSerializer = new JSONAPISerializer(objectType, {
    attributes: objectAttributes
  });

  var serialized = ObjectSerializer.serialize(object);

  if (Object.prototype.toString.call(object) === '[object Array]') {

    var totalPages = (limit && totalLength) ? Math.ceil(totalLength / limit) : 0
    serialized.meta = { total_pages: totalPages }
  }

  return serialized

}

exports.deserializeJSONAPIDataIntoObject = function (jsonApiData, callback) {

  var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

  if (Object.keys(jsonApiData).indexOf("data") == -1) {
    jsonApiData = { "data": { "attributes": jsonApiData } }
  }

  return new Promise(function (fulfill, reject) {

    var deserialized = new JSONAPIDeserializer({ keyForAttribute: checkAndSelectCaseToUse }).deserialize(jsonApiData, function (err, deserialized) {
      if (err) reject(err);
      else fulfill(deserialized);
      
      if (callback) callback(deserialized);

    });
  });

}

function checkAndSelectCaseToUse(attribute) {

  let containsAnIdSubString = attribute.indexOf("Id") !== -1
  var Inflector = require('./inflector');
  var opts = {"keyForAttribute" : null} 

  if (containsAnIdSubString) {
     opts["keyForAttribute"] = "CamelCase"
  } else {
     opts["keyForAttribute"] = "camelCase"
  }

  return Inflector.caserize(attribute, opts);
}

exports.serializeSimpleErrorIntoJSONAPI = function (message, attribute) {


  var error = {
    "errors": [
      {
        "detail": message,
        "source": {
          "pointer": "data/attributes/" + attribute
        }
      }
    ]
  }

  return error

}

exports.deserializeQueryPaginationIntoVariables = function (req) {

  var limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 0

  var skip = parseInt(req.query.page) ? parseInt(req.query.page) : 1
  skip = limit * (skip - 1)
  skip = skip >= 0 ? skip : 0

  delete req.query.page
  delete req.query.limit

  return { limit: limit, skip: skip }
}
