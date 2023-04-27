/* global Module */

/* Magic Mirror
 * Module: MMM-RefreshClientOnly
 *
 * By Andrés Vanegas <ukab72106@gmail.com>
 * MIT Licensed.
 */

Module.register("MMM-RefreshClientOnly", {
  name: "MMM-RefreshClientOnly",
  connected: false,
  errors: 0,
  defaults: {
    maxSecondsOffline: 5
  },
  uuid: null,

  start() {
    this.info("Starting");
    this.name = "MMM-RefreshClientOnly";
    this.connected = false;
    this.info("Started");
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

  socketNotificationReceived(notification, payload) {
    switch (notification.replace(new RegExp(`${this.name}_`, "gi"), "")) {
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
  }
});
