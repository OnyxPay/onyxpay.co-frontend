import React from "react";
import { notification } from "antd";
import { parseBcError } from "utils/blockchain";
import Countdown from "components/Countdown";
import SupportLink from "components/SupportLink";

/* 
type:
  success
  error
  info
  warning
*/

export function showNotification({ type = "info", msg, desc, duration = 0, key }) {
	return notification[type.toLowerCase()]({
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
		msg: "Timeout Error",
		desc:
			"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
	});
}

export function showBcError(er) {
	// er should be er.message property of Error
	return showNotification({
		type: "error",
		msg: "Blockchain error",
		desc: parseBcError(er),
	});
}

export function showGasCompensationError(errorMsg) {
	return showNotification({
		type: "error",
		msg: "Gas compensation error",
		desc: (
			<>
				{errorMsg}
				<div>
					Please <SupportLink />
				</div>
			</>
		),
	});
}

export function showUserIsBlockedNotification() {
	showNotification({
		msg: (
			<>
				Your account has been blocked by administrator. Please&nbsp;
				<SupportLink />
			</>
		),
		desc: (
			<strong>
				You will be logged out after&nbsp;
				<Countdown date={new Date().getTime() + 5000} onlySeconds={true} /> sec
			</strong>
		),
	});
}
