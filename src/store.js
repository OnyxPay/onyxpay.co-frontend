import { createStore, applyMiddleware } from "redux";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import thunk from "redux-thunk";
import createRootReducer from "./redux";
import { composeWithDevTools } from "redux-devtools-extension";

const sagaMiddleware = createSagaMiddleware();
export const history = createBrowserHistory();
const middlewares = [thunk, routerMiddleware(history), sagaMiddleware];

const enhancers = [];

function configureStore(initialState) {
	const store = createStore(
		createRootReducer(history), // root reducer with router state
		initialState,
		composeWithDevTools(applyMiddleware(...middlewares), ...enhancers)
	);

	return store;
}

const store = configureStore({});
sagaMiddleware.run(rootSaga);

export function getStore() {
	return store;
}
