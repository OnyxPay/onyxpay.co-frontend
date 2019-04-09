export const WRITE_LOG = "WRITE_LOG";
export const CLEAR_LOGS = "CLEAR_LOGS";

const initialState = JSON.parse(localStorage.getItem("logs")) || [];

export const logsReducer = (state = initialState, action) => {
  switch (action.type) {
    case WRITE_LOG:
      let logs = [...state, action.payload];
      localStorage.setItem("logs", JSON.stringify(logs));
      return logs;
    case CLEAR_LOGS:
      localStorage.removeItem("logs");
      return [];
    default:
      return state;
  }
};

export const writeLog = (action, params, result) => {
  const time = new Date().toLocaleString();
  return {
    type: WRITE_LOG,
    payload: { time, action, params, result }
  };
};

export const clearLogs = () => {
  return {
    type: CLEAR_LOGS
  };
};
