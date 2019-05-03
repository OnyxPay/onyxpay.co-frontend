import { getStore, history } from "../store";
import Actions from "../redux/actions";

function isCookieAvailable(name) {
	return document.cookie.split(";").filter(item => {
		return item.includes(name);
	}).length;
}

function isTokenAvailable(name) {
	return sessionStorage.getItem(name);
}

function getCookie(cname) {
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

export const wait = (ms, resolveWith) => {
	return new Promise(resolve => {
		setTimeout(() => resolve(resolveWith), ms);
	});
};

function authProvider() {
	const isAuthenticated = isTokenAvailable("auth");
	const store = getStore();

	console.log("isAuthenticated", isAuthenticated);
	if (!isAuthenticated) {
		wait(0, { name: "Lucas", role: "user" })
			.then(res => {
				store.dispatch(Actions.user.saveUser(res));
			})
			.catch(er => {
				console.log(er);
			});
	} else {
		history.push("/login");
	}
}

export { authProvider };
