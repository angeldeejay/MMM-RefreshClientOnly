/* global Module */

/* Magic Mirror
 * Module: MMM-RefreshClientOnly
 *
 * By Andrés Vanegas <ukab72106@gmail.com>
 * MIT Licensed.
 */

Module.register("MMM-RefreshClientOnly", {
  name: "MMM-RefreshClientOnly",
  connected: true,
  errors: 0,
  defaults: {
    maxSecondsOffline: 5
  },
  uuid: null,

  requiresVersion: "2.1.0", // Required version of MagicMirror

  start() {
    this.info("Starting");
    this.info("Started");
  },

  info(...args) {
    Log.info(`${this.name} ::`, ...args);
  },

  askUuid() {
    this._sendNotification("GET_UUID");
    setTimeout(() => this.askUuid(), 1000);
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
    this.info("Refreshing");
    // https://stackoverflow.com/questions/3715047/how-to-reload-a-page-using-javascript
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
  },

  _sendNotification(notification, payload) {
    this.sendSocketNotification(`${this.name}_${notification}`, payload);
  },

  _notificationReceived(notification, payload) {
    switch (notification) {
      case "UUID":
        if (this.uuid === null) {
          this.uuid = payload;
        } else if (this.uuid !== payload) {
          this.refresh();
        }
        break;
      case "UPDATE_CSS":
        this.updateCss();
        break;
      default:
    }
  },

  notificationReceived(payload, notification) {
    if (notification === "ALL_MODULES_STARTED") {
      this.info("All modules loaded successfully. Asking UUID from backend");
      this.askUuid();
    }
  },

  socketNotificationReceived(notification, payload) {
    this._notificationReceived(
      notification.replace(new RegExp(`${this.name}_`, "gi"), ""),
      payload
    );
  }
});
