import { createStore, applyMiddleware, compose } from "redux";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import thunk from "redux-thunk";
import createRootReducer from "./redux";
const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory();
const middlewares = [thunk, routerMiddleware(history), sagaMiddleware];

const enhancers = [];

if (process.env.NODE_ENV === "development") {
	const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

	if (typeof devToolsExtension === "function") {
		enhancers.push(devToolsExtension());
	}
}

function configureStore(initialState) {
	const store = createStore(
		createRootReducer(history), // root reducer with router state
		initialState,
		compose(
			applyMiddleware(...middlewares),
			...enhancers
		)
	);

	return store;
}

const store = configureStore({});
sagaMiddleware.run(rootSaga);

export function getStore() {
	return store;
}
