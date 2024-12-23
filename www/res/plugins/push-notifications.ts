import { PushNotifications } from "@capacitor/push-notifications";

const register = async () => {
	let STATUS = await PushNotifications.checkPermissions();
	console.log(STATUS);

	if (STATUS.receive === "prompt") {
		STATUS = await PushNotifications.requestPermissions();
		console.log(STATUS);
	}

	if (STATUS.receive !== "granted") {
		console.log("not permission");
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
};

register();
