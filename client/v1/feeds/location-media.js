var _ = require('lodash');
var util = require('util');
var FeedBase = require('./feed-base');

function LocationMediaFeed(session, locationId, limit, includeRankeds) {
    this.limit = parseInt(limit) || null;
    this.locationId = locationId;
    this.includeRankeds = includeRankeds;
    FeedBase.apply(this, arguments);
}
util.inherits(LocationMediaFeed, FeedBase);

module.exports = LocationMediaFeed;
var Media = require('../media');
var Request = require('../request');
var Helpers = require('../../../helpers');
var Exceptions = require('../exceptions');

LocationMediaFeed.prototype.get = function () {
    var that = this;
    return new Request(that.session)
        .setMethod('GET')
        .setResource('locationFeed', {
            id: that.locationId,
            maxId: that.getCursor(),
            rankToken: Helpers.generateUUID()
        })
        .send()
        .then(function(data) {
            that.moreAvailable = data.more_available && !!data.next_max_id;
            if (that.moreAvailable)
                that.setCursor(data.next_max_id);
            if(that.includeRankeds){
                return _.map(_.isEmpty(data.items) ? data.ranked_items : data.items.concat(data.ranked_items), function (medium) {
                    return new Media(that.session, medium);
                });
            }else{
                return _.map(_.isEmpty(data.items) ? data.ranked_items : data.items, function (medium) {
                    return new Media(that.session, medium);
                });
            }
        })
        // will throw an error with 500 which turn to parse error
        .catch(Exceptions.ParseError, function(){
            throw new Exceptions.PlaceNotFound();
        })
};