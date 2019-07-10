import { notification } from "antd";

/* 
type:
  success
  error
  info
  warning
*/

export function showNotification({ type = "info", msg, desc, duration = 10, key }) {
	return notification[type]({
		message: msg,
		description: desc,
		duration,
		key,
	});
}

export function closeNotification(key) {
	notification.close(key);
}

export function showTimeoutNotification() {
	return showNotification({
		type: "info",
		msg:
			"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
	});
}
