import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { history, getStore } from "./store";
import "./assets/styles/index.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { init } from "./websock/client";
init();
ReactDOM.render(
	<Provider store={getStore()}>
		<ConnectedRouter history={history}>
			<App />
		</ConnectedRouter>
	</Provider>,
	document.getElementById("root")
);

serviceWorker.unregister();
