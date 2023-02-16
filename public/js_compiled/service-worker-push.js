"use strict";

//Event that shows a notification when is received by push
self.addEventListener("push", function (event) {
  var data = event.data.json();
  console.log(data, typeof (data === null || data === void 0 ? void 0 : data.title) === "string");
  if (typeof (data === null || data === void 0 ? void 0 : data.title) === "string") {
    console.log("Sending");
    self.registration.showNotification(data.title).then(console.log);
  }
  if ("setAppBadge" in navigator && typeof data.badgeCount === "number") {
    var _data$badgeCount;
    navigator.setAppBadge((_data$badgeCount = data.badgeCount) !== null && _data$badgeCount !== void 0 ? _data$badgeCount : 2);
  }
});