var Resource = require('./resource');
var _ = require('lodash');
var util = require('util');

function StoryTool() {
    StoryTool.apply(this, arguments);
}
util.inherits(StoryTool, Resource);

module.exports = StoryTool;
var Request = require('./request');

StoryTool.getUserStoryFeed = function (session, userPk) {
    return new Request(session)
        .setMethod('GET')
        .setResource('storyFeed', {
            id: userPk,
        })
        .generateUUID()
        .send()
        .then(function(data) {
            return data;
        })
};

StoryTool.markStoriesSeen = function (session, reels) {
    return new Request(session)
        .setMethod('POST')
        .setResource('storySeen_v2')
        .generateUUID()
        .setData({reels: reels,
            container_module: 'feed_timeline',
            reel_media_skipped: [],
            live_vods: [],
            live_vods_skipped: [],
            nuxes: [],
            nuxes_skipped: [],
        })
        .signPayload()
        .send()
        .then(function(data) {
            return data;
        })
};
