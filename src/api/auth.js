import { getStore } from "../store";
import Actions from "../redux/actions";

function isCookieAvailable(name) {
	return document.cookie.split(";").filter(item => {
		return item.includes(name);
	}).length;
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

function authProvider(redirectLink) {
	const isAuthenticated = !isCookieAvailable("foo"); // TODO: ?
	const store = getStore();

	if (isAuthenticated) {
		/*
      send cookie/token to server for check
        if cookie is valid
          save user to store
        else  
          delete cookie, redirect to login
    */
		const authCookie = getCookie("foo");
		console.log("authCookie:", authCookie);

		wait(1000, { name: "Lucas", role: "user" })
			.then(res => {
				store.dispatch(Actions.user.saveUser(res));
			})
			.catch(er => {
				console.log(er);
			});
	} else {
		return window.location.replace(redirectLink); //redirect;
	}
}

export { authProvider };
