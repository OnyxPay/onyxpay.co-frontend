import { createStore, applyMiddleware, compose } from "redux";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import thunk from "redux-thunk";
import createRootReducer from "./redux";

export const history = createBrowserHistory();

const enhancers = [];
const middlewares = [thunk, routerMiddleware(history)];

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
export default configureStore({});
