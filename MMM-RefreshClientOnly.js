/* global Module */

/* Magic Mirror
 * Module: MMM-RefreshClientOnly
 *
 * By Andrés Vanegas <ukab72106@gmail.com>
 * MIT Licensed.
 */

Module.register("MMM-RefreshClientOnly", {
  connected: true,
  errors: 0,
  defaults: {
    maxSecondsOffline: 5
  },
  uuid: null,

  requiresVersion: "2.1.0", // Required version of MagicMirror

  start: function () {
    this.checkConnection();
  },

  refresh: function () {
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

  socketNotificationReceived: function (notification, payload) {
    if (notification === "UUID") {
      if (this.uuid === null) {
        this.uuid = payload;
      } else if (this.uuid !== payload) {
        this.refresh();
      }
    }
  },

  checkConnection: function () {
    this.sendSocketNotification("GET_UUID");
    setTimeout(() => this.checkConnection(), 1000);
  }
});
