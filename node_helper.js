/**
 * @file node_helper.js
 *
 * @author angeldeejay
 * @license MIT
 */

const { v4: uuid } = require("uuid");
const fs = require("node:fs");
const Log = require("../../js/logger.js");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  uuid: null,
  cssMtime: null,
  cssPath: path.join(path.dirname(__dirname), "css", "custom.css"),
  start: function () {
    Log.log("Starting MMM-RefreshClientOnly");
    this.uuid = uuid();
    setInterval(() => this.checkCssMtime(), 1000);
  },

  checkCssMtime: function () {
    Log.info(`MMM-RefreshClientOnly :: Custom stylesheet: ${this.cssPath}`);
    if (fs.existsSync(this.cssPath)) {
      Log.info(`MMM-RefreshClientOnly :: Custom stylesheet exists, checking`);
      const stats = fs.statSync(this.cssPath);
      const lastModifiedTime = stats.mtime;
      const savedModifiedTime = this.cssMtime;
      if (lastModifiedTime !== savedModifiedTime) {
        this.cssMtime = lastModifiedTime;
        if (savedModifiedTime !== null) {
          Log.info(
            `MMM-RefreshClientOnly :: Custom stylesheet changed. Reloading`
          );
          this.uuid = uuid();
        }
      } else {
        Log.info(`MMM-RefreshClientOnly :: Custom stylesheet not changed`);
      }
    } else {
      Log.info(`MMM-RefreshClientOnly :: Custom stylesheet doesn't exists`);
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_UUID") {
      this.sendSocketNotification("UUID", this.uuid);
    }
  }
});
