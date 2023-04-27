/**
 * @file node_helper.js
 *
 * @author angeldeejay
 * @license MIT
 */

const md5 = require("md5");
const fs = require("fs");
const { join, dirname, basename } = require("path");
const Log = require("logger");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  name: basename(__dirname),
  uuid: null,
  cssMtime: null,
  cssPath: null,

  info(msg, ...args) {
    Log.info(`${this.name} :: ${msg}`, ...args);
  },

  start() {
    this.name = basename(__dirname);
    this.cssMtime = null;
    this.cssPath = join(dirname(dirname(__dirname)), "css", "custom.css");
    this.uuid = md5(new Date().toString());
    this.info("UUID is " + this.uuid);
    setInterval(() => this.performChecks(), 1000);
    this.info("Started");
  },

  performChecks() {
    this.sendSocketNotification(`${this.name}-UUID`, this.uuid);
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
          this.sendSocketNotification(`${this.name}-UPDATE_CSS`, true);
        }
      }
    }
  }
});
