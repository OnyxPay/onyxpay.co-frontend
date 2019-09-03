import { h24Mc, h12Mc } from "api/constants";
import { isBase58Address } from "utils/validate";

export function isCookieAvailable(name) {
	return document.cookie.split(";").filter(item => {
		return item.includes(name);
	}).length;
}

export function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

export const wait = (ms = 300, resolveWith = null) => {
	return new Promise(resolve => {
		setTimeout(() => resolve(resolveWith), ms);
	});
};

export function generateTokenTimeStamp() {
	const tokenLifeSpan = 1000 * 60 * 60 * 12; // 12 hours in ms
	return Math.floor(new Date().getTime() / tokenLifeSpan).toString(16);
}

export function getPerformerName(takerAddress, taker = {}) {
	const { firstName, lastName } = taker;
	if (firstName || lastName) {
		return `${firstName} ${lastName}`;
	} else {
		return takerAddress;
	}
}

export function getLocalTime(date) {
	return new Date(date).toLocaleString();
}

export function calcTimeDiff(timestamp) {
	const trxCreatedMs = new Date(timestamp).getTime();
	const nowMs = new Date().getTime();
	return nowMs - trxCreatedMs;
}

export function is24hOver(timestamp) {
	const diff = calcTimeDiff(timestamp);
	return diff > h24Mc;
}

export function is12hOver(timestamp) {
	const diff = calcTimeDiff(timestamp);
	return diff > h12Mc;
}

export function sortValues(valA, valB) {
	if (valA < valB) {
		return -1;
	}
	if (valA > valB) {
		return 1;
	}
	return 0;
}

export function formatUserRole(role) {
	if (role === "user") {
		return "Client";
	} else if (role === "agent") {
		return "Agent";
	} else if (role === "superagent") {
		return "Super agent";
	} else if (role === "super_admin") {
		return "Super admin";
	} else if (role === "support") {
		return "Support";
	}
}

export function trimAddress(addr, validate = true) {
	const sliceSize = 5;
	if (validate && !isBase58Address(addr)) {
		return addr;
	}
	return addr.slice(0, sliceSize) + "..." + addr.slice(addr.length - sliceSize, addr.length);
}
