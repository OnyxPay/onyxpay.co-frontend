import { all } from "redux-saga/effects";
import userUpdate from "./userUpdate";
export default function* rootSaga() {
	yield all([userUpdate()]);
}
