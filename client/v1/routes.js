var CONSTANTS = require('./constants');
var _ = require('lodash');

var URLs = {};
_.each(CONSTANTS.ROUTES, function (val, key) {
    URLs[key] = _.template(val);
});

var WEB_URLs = {};
_.each(CONSTANTS.WEB_ROUTES, function (val, key) {
    WEB_URLs[key] = _.template(val);
});

exports.getUrl = function(key, data) {
    if(!_.isFunction(URLs[key]))
        throw new Error("Url with key `"+ key +"` is not available");
    if(key.indexOf('_v2') > -1){
        return CONSTANTS.API_ENDPOINT2 + URLs[key](data || {});
    }else if(key.indexOf('_vnone') > -1){
        return CONSTANTS.HOST + URLs[key](data || {});
    }else{
        return CONSTANTS.API_ENDPOINT + URLs[key](data || {});
    }
}

exports.getWebUrl = function(key, data) {
    if(!_.isFunction(WEB_URLs[key])) 
        throw new Error("Web url with key `"+ key +"` is not available");
    return CONSTANTS.WEBHOST + WEB_URLs[key](data || {});   
}


