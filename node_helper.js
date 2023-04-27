/**
 * @file node_helper.js
 *
 * @author angeldeejay
 * @license MIT
 */

const { v4: uuid } = require("uuid");
const cssPath = "../../css/custom.css";
const fs = require("node:fs");
const Log = require("../../js/logger.js");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  uuid: null,
  cssMtime: null,
  start: function () {
    Log.log("Starting MMM-RefreshClientOnly");
    this.uuid = uuid();
    setInterval(() => this.checkCssMtime(), 1000);
  },

  checkCssMtime: function () {
    if (fs.existsSync(cssPath)) {
      const stats = fs.statSync(cssPath);
      const lastModifiedTime = stats.mtime;
      const savedModifiedTime = this.cssMtime;
      if (lastModifiedTime !== savedModifiedTime) {
        this.cssMtime = lastModifiedTime;
        if (savedModifiedTime !== null) {
          Log.info(`Updated custom stylesheet. Reloading`);
          this.uuid = uuid();
        }
      }
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_UUID") {
      this.sendSocketNotification("UUID", this.uuid);
    }
  },
});
