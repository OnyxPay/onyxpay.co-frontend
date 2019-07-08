import io from "socket.io-client";
import { wssBackEnd, wsMessages } from "../api/constants";
const socket = io(wssBackEnd, { path: "/wsapp/" });
export const init = store => {
	wsMessages.forEach(type =>
		socket.on(type, payload =>
			//store.dispatch({ type, payload })
			console.info("websok msg ", payload)
		)
	);
};
export const emit = (type, payload) => socket.emit(type, payload);
