"use strict";

//Event that shows a notification when is received by push
self.addEventListener("push", function (event) {
  var _data$badgeCount;
  var data = event.data.json();
  if (typeof data.title === "string") self.registration.showNotification(data.title, {
    body: data.body
  });
  if ("setAppBadge" in navigator && typeof data.badgeCount === "number") navigator.setAppBadge((_data$badgeCount = data.badgeCount) !== null && _data$badgeCount !== void 0 ? _data$badgeCount : 2);
});