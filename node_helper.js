/**
 * @file node_helper.js
 *
 * @author angeldeejay
 * @license MIT
 */

const { v4: uuid } = require("uuid");
const fs = require("node:fs");
const path = require("node:path");
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
    this.info("Starting");
    this.cssMtime = null;
    this.uuid = uuid();
    this.info("Evaluating changes in " + this.cssPath);
    setInterval(() => this.checkCssMtime(), 500);
    this.info("Started");
  },

  info: function (...args) {
    Log.info(`${this.name} ::`, ...args);
  },

  checkCssMtime: function () {
    if (fs.existsSync(this.cssPath)) {
      const stats = fs.statSync(this.cssPath);
      const lastModifiedTime = `${stats.mtime}`;
      const savedModifiedTime =
        this.cssMtime === null ? null : `${this.cssMtime}`;
      if (
        savedModifiedTime === null ||
        lastModifiedTime !== savedModifiedTime
      ) {
        this.cssMtime = lastModifiedTime;
        if (savedModifiedTime !== null) {
          this.info("Stylesheets updated");
          this._sendNotification("UPDATE_CSS", true);
        }
      }
    }
  },

  _sendNotification(notification, payload) {
    this.sendSocketNotification(`${this.name}_${notification}`, payload);
  },

  _notificationReceived(notification, payload) {
    if (notification === "GET_UUID") {
      this._sendNotification("UUID", this.uuid);
    }
  },

  socketNotificationReceived: function (notification, payload) {
    this._notificationReceived(
      notification.replace(new RegExp(`${this.name}_`, "gi"), ""),
      payload
    );
  }
});
