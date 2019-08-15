import { notification } from "antd";
import { parseBcError } from "utils/blockchain";
import { isBase58Address } from "utils/validate";

/* 
type:
  success
  error
  info
  warning
*/

export function showNotification({ type = "info", msg, desc, duration = 5, key }) {
	return notification[type.toLocaleLowerCase()]({
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
		msg: "Block-chain error",
		desc: parseBcError(er),
	});
}

export function showGasCompensationError() {
	return showNotification({
		type: "error",
		msg: "Gas compensation error",
		desc: "Something went wrong at the gas compensation server",
	});
}

export function trimAddress(addr) {
	const sliceSize = 5;
	if (!isBase58Address(addr)) {
		return addr;
	}
	return addr.slice(0, sliceSize) + "..." + addr.slice(addr.length - sliceSize, addr.length);
}
