/**
 * @file node_helper.js
 *
 * @author angeldeejay
 * @license MIT
 */

const NodeHelper = require("node_helper");
const Log = require("../../js/logger.js");
const { v4: uuid } = require("uuid");

module.exports = NodeHelper.create({
  uuid: null,
  start: function () {
    Log.log("Starting MMM-RefreshClientOnly");
    this.uuid = uuid();
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_UUID") {
      this.sendSocketNotification("UUID", this.uuid);
    }
  }
});
