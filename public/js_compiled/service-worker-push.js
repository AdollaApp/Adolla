"use strict";

//Event that shows a notification when is received by push
self.addEventListener("push", function (event) {
  var data = event.data.json();
  if (typeof (data === null || data === void 0 ? void 0 : data.title) === "string") {
    self.registration.showNotification(data.title, {
      body: data.body
    });
  }
  if ("setAppBadge" in navigator && typeof data.badgeCount === "number") {
    var _data$badgeCount;
    navigator.setAppBadge((_data$badgeCount = data.badgeCount) !== null && _data$badgeCount !== void 0 ? _data$badgeCount : 2);
  }
});