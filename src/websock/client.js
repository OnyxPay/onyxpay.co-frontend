import io from "socket.io-client";
import { wssBackEnd, wsMessages, roleCodes } from "../api/constants";

const socket = io(wssBackEnd, {
	path: "/wsapp/",
	query: { walletAddress: "AQpqWQMS2E7XYh4PP6m5Jb369KSuV7jxtK" },
});
export const init = store => {
	wsMessages.forEach(type =>
		socket.on(type, payload =>
			//console.info("websok msg ", payload);
			store.dispatch({
				type: type,
				payload: { role: payload.role, roleCode: roleCodes[payload.role] },
			})
		)
	);
};
export const emit = (type, payload) => socket.emit(type, payload);
