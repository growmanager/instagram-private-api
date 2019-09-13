var _ = require('lodash');
var util = require('util');
var FeedBase = require('./feed-base');

function LocationMediaFeed(session, locationId, limit, includeRankeds, forStories = false) {
    this.limit = parseInt(limit) || null;
    this.locationId = locationId;
    this.includeRankeds = includeRankeds;
    this.forStories = forStories;
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
    var data = {
        tab: that.includeRankeds ? 'ranked' :'recent',
        rankToken: Helpers.generateUUID()
    };
    if(that.getCursor()){
        var cursor = that.getCursor();
        data.max_id = cursor.max_id;
        data.next_media_ids = JSON.stringify(cursor.next_media_ids);
        data.page = cursor.next_page;
    }
    return new Request(that.session)
        .setMethod('POST')
        .setResource('locationFeed', {id: that.locationId})
        .setData(data)
        .send()
        .then(function(data) {
            that.moreAvailable = data.more_available && !!data.next_max_id;
            if (that.moreAvailable)
                that.setCursor({max_id: data.next_max_id, next_page: data.next_page, next_media_ids: data.next_media_ids});
            var items = [];
            for(let section of data.sections){
                if(section && section.layout_content && section.layout_content.medias && section.layout_content.medias.length > 0){
                    for(let media of section.layout_content.medias){
                        if(media.media){
                            items.push(media.media);
                        }
                    }
                }
            }
            return _.map(items, function (medium) {
                return new Media(that.session, medium);
            });
        })
        // will throw an error with 500 which turn to parse error
        .catch(Exceptions.ParseError, function(){
            throw new Exceptions.PlaceNotFound();
        })
};

LocationMediaFeed.prototype.getOldVersion = function () {
    var that = this;
    return new Request(that.session)
        .setMethod('GET')
        .setResource('locationFeedOld', {
            id: that.locationId,
            maxId: that.getCursor(),
            rankToken: Helpers.generateUUID()
        })
        .send()
        .then(function(data) {
            if(that.forStories){
                return data.story ? data.story : {};
            }
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
