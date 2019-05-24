import { getStore } from "../store";
import Actions from "../redux/actions";

/* 
	listen to 401 status code
	if so show popup with logout button
*/

export function syncLoginState() {
	const store = getStore();
	window.addEventListener("storage", e => {
		if (e.key === "logged_in" && e.oldValue && !e.newValue) {
			// if logged out in one tab, do logout in others
			store.dispatch(Actions.auth.logOut());
		} else if (e.key === "wallet" && e.oldValue && !e.newValue) {
			store.dispatch(Actions.wallet.clearWallet());
		} else if (e.key === "wallet" && !e.oldValue && e.newValue) {
			store.dispatch(Actions.wallet.setWallet(e.newValue));
		}
	});
}
