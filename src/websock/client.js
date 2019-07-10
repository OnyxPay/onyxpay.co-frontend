import { wssBackEnd, wsMessages, roleCodes } from "../api/constants";
import io from "socket.io-client";
import { getStore } from "../store";
let socket;
export const wsClientConnect = walletAddress => {
	io.connect(wssBackEnd, {
		path: "/wsapp/",
		query: { walletAddress: walletAddress },
	});
	wsMessages.forEach(type =>
		socket.on(type, payload =>
			getStore().dispatch({
				type: type,
				payload: { role: payload.role, roleCode: roleCodes[payload.role] },
			})
		)
	);
};
export const wsClientDisconnect = () => {
	if (socket) {
		socket.close();
	}
};
//export const emit = (type, payload) => socket.emit(type, payload);
