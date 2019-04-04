import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import logs from "./logs";

export default history =>
  combineReducers({
    router: connectRouter(history),
    logs
  });
