import React from "react";
import { takeEvery, put } from "redux-saga/effects";
import { wsEvents } from "../api/constants";
import { showNotification } from "../components/notification";
import { userStatus } from "../api/constants";

const upgradeUser = function*(action) {
	try {
		if (action.payload.status && action.payload.status === userStatus.blocked) {
			showNotification({
				desc: (
					<>
						Your account has been blocked by administrator. Please&nbsp;
						<a href="mailto:support@onyxpay.co">contact the support</a>
					</>
				),
			});
			yield put({ type: "LOG_OUT" });
		}
	} catch (err) {
		console.error(err);
	}
};

export default function* watchSaga() {
	yield takeEvery(wsEvents.upgradeUser, upgradeUser);
}
