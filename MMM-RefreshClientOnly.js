/* global Module */

/* Magic Mirror
 * Module: MMM-RefreshClientOnly
 *
 * By Andrés Vanegas <ukab72106@gmail.com>
 * MIT Licensed.
 */

Module.register("MMM-RefreshClientOnly", {
  name: "MMM-RefreshClientOnly",
  uuid: null,
  refreshing: false,

  start() {
    this.refreshing = false;
    this.uuid = null;
  },

  info(msg, ...args) {
    Log.info(`${this.name} :: ${msg}`, ...args);
  },

  updateCss() {
    this.info("Updating stylesheets");
    const styleTags = document.getElementsByTagName("link");
    for (const tag of styleTags) {
      if (tag.rel.toLowerCase().indexOf("stylesheet") >= 0 && tag.href) {
        const url = tag.href.replace(/(&|%5C?)forceReload=\d+/, "");
        const connector = url.indexOf("?") >= 0 ? "&" : "?";
        tag.href = `${url}${connector}forceReload=${new Date().valueOf()}`;
      }
    }
  },

  refresh() {
    this.info("Server restarted. Refreshing");
    // https://stackoverflow.com/questions/3715047/how-to-reload-a-page-using-javascript
    setTimeout(() => {
      try {
        // JavaScript 1.2 and newer
        window.location.reload(true);
      } catch (_) {
        try {
          // JavaScript 1.1
          window.location.replace(
            window.location.pathname +
              window.location.search +
              window.location.hash
          );
        } catch (_) {
          try {
            // JavaScript 1.0
            window.location.href =
              window.location.pathname +
              window.location.search +
              window.location.hash;
          } catch (_) {}
        }
      }
    }, 1000);
  },

  notificationReceived(notification, ..._) {
    if (notification === "ALL_MODULES_STARTED") {
      this.sendSocketNotification(`${this.name}-READY`, true);
    }
  },

  socketNotificationReceived(notification, payload) {
    switch (notification.replace(new RegExp(`${this.name}-`, "gi"), "")) {
      case "UUID":
        if (this.uuid === null) {
          this.info("Received UUID: " + payload);
          this.uuid = payload;
        } else if (this.uuid !== payload) {
          this.refreshing = true;
          this.info(`UUID changed: ${this.uuid} | ${payload}`);
          this.refresh();
        }
        break;
      case "UPDATE_CSS":
        if (!this.refreshing) {
          this.updateCss();
        }
        break;
      default:
    }
  }
});
