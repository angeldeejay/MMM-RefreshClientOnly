/**
 * @file node_helper.js
 *
 * @author angeldeejay
 * @license MIT
 */

const md5 = require("md5");
const fs = require("fs");
const path = require("path");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  name: path.basename(__dirname),
  uuid: null,
  cssMtime: null,
  cssPath: null,

  _sendNotification(notification, payload) {
    this.sendSocketNotification(`${this.name}_${notification}`, payload);
  },

  info(...args) {
    Log.info(`${this.name} ::`, ...args);
  },

  start() {
    this.info("Starting");
    this.cssMtime = null;
    this.cssPath = path.join(
      path.dirname(path.dirname(__dirname)),
      "css",
      "custom.css"
    );
    this.uuid = md5(new Date().toString());
    this.info("UUID is " + this.uuid);
    this.info("Evaluating changes in " + this.cssPath);
    setInterval(() => {
      this.checkCssMtime();
      this._sendNotification("UUID", this.uuid);
    }, 1000);
    this.info("Started");
  },

  checkCssMtime() {
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
  }
});
