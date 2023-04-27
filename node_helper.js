/**
 * @file node_helper.js
 *
 * @author angeldeejay
 * @license MIT
 */

const { v4: uuid } = require("uuid");
const fs = require("node:fs");
const path = require("node:path");
const Log = require("../../js/logger.js");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  name: path.basename(__dirname),
  uuid: null,
  cssMtime: null,
  cssPath: path.join(
    path.dirname(path.dirname(__dirname)),
    "css",
    "custom.css"
  ),
  start: function () {
    this.log("Starting");
    this.uuid = uuid();
    setInterval(() => this.checkCssMtime(), 1000);
    this.log("Started");
  },

  log: function (...args) {
    Log.log(`${this.name} ::`, ...args);
  },
  info: function (...args) {
    Log.info(`${this.name} ::`, ...args);
  },

  checkCssMtime: function () {
    if (fs.existsSync(this.cssPath)) {
      const stats = fs.statSync(this.cssPath);
      const lastModifiedTime = `${stats.mtime}`;
      const savedModifiedTime =
        this.cssMtime === null ? "never" : `${this.cssMtime}`;
      if (lastModifiedTime !== savedModifiedTime) {
        this.cssMtime = lastModifiedTime;
        if (savedModifiedTime !== "never") {
          this.info(`Custom stylesheet changed. Reloading`);
          this.uuid = uuid();
        }
      }
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_UUID") {
      this.sendSocketNotification("UUID", this.uuid);
    }
  }
});
