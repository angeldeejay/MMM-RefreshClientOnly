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
  cssPaths: {},

  info(msg, ...args) {
    Log.info(`${this.name} :: ${msg}`, ...args);
  },

  start() {
    this.name = basename(__dirname);

    const mmRoot = dirname(dirname(__dirname));
    this.cssPaths = [
      // MAgicMirror >= v2.35.0
      "config",
      // MAgicMirror < v2.35.0
      "css"
    ]
      .map((f) => join(mmRoot, f))
      .filter((f) => fs.existsSync(f) && fs.statSync(f).isDirectory())
      .map((f) => join(f, "custom.css"))
      .filter((f) => fs.existsSync(f) && fs.statSync(f).isFile())
      .reduce((acc, f) => ({ ...acc, [f]: 0 }), {});

    this.uuid = md5(new Date().toString());
    this.info("UUID is " + this.uuid);
    setInterval(() => this.performChecks(), 250);
    this.info("Started");
  },

  performChecks() {
    this.sendSocketNotification(`${this.name}-UUID`, this.uuid);

    Object.entries(this.cssPaths).forEach(([cssPath, mtime]) => {
      fs.stat(cssPath, (err, stats) => {
        if (err) {
          return;
        }
        const lastModifiedTime = stats.mtimeMs;
        const savedModifiedTime = mtime ?? 0;
        if (lastModifiedTime > savedModifiedTime) {
          this.cssPaths[cssPath] = lastModifiedTime;
          if (savedModifiedTime !== 0) {
            this.info("Stylesheets updated");
            this.sendSocketNotification(`${this.name}-UPDATE_CSS`, true);
          }
        }
      });
    });
  }
});
