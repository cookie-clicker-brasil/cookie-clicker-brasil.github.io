import { PushNotifications } from "@capacitor/push-notifications";
import $ from "jquery";

$(async () => {
  if (window.Capacitor.getPlatform() !== "android") {
    console.log(
      `PushNotifications: Unsupported platform (${window.Capacitor.getPlatform()})`,
    );
    return;
  }

  let STATUS = await PushNotifications.checkPermissions();
  console.log(STATUS);

  if (STATUS.receive === "prompt") {
    STATUS = await PushNotifications.requestPermissions();
    console.log(STATUS);
  }

  if (STATUS.receive !== "granted") {
    console.log("Not permission");
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener("registration", (token) => {
    console.log(token);
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.log(error);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log(notification);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log(action);
  });
});
