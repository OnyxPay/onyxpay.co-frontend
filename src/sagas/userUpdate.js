import React from "react";
import { takeEvery, put, delay } from "redux-saga/effects";
import { wsEvents } from "../api/constants";
import { showNotification } from "../components/notification";
import { userStatus } from "../api/constants";
import { LOG_OUT } from "../redux/auth";
import Countdown from "components/Countdown";

const upgradeUser = function*(action) {
	try {
		if (action.payload.status || action.payload.role) {
			if (action.payload.status && action.payload.status === userStatus.blocked) {
				showNotification({
					msg: (
						<>
							Your account has been blocked by administrator. Please&nbsp;
							<a href="mailto:support@onyxpay.co">contact the support</a>
						</>
					),
					desc: (
						<strong>
							You will be logged out after{" "}
							<Countdown date={new Date().getTime() + 5000} onlySeconds={true} /> sec
						</strong>
					),
				});
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
