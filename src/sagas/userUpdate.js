import { takeEvery, put, delay } from "redux-saga/effects";
import { wsEvents } from "../api/constants";
import { showUserIsBlockedNotification } from "../components/notification";
import { userStatus } from "../api/constants";
import { LOG_OUT } from "../redux/auth";

const upgradeUser = function*(action) {
	try {
		if (action.payload.status || action.payload.role) {
			if (action.payload.status && action.payload.status === userStatus.blocked) {
				showUserIsBlockedNotification();
				yield delay(5000);
			}

			yield put({ type: LOG_OUT });
			window.location.reload();
		}
	} catch (err) {
		console.error(err);
	}
};

export default function* watchSaga() {
	yield takeEvery(wsEvents.upgradeUser, upgradeUser);
}
