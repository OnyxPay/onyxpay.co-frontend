import { writeLog, clearLogs } from "./logs";
import { setWallet, clearWallet } from "./wallet";
import { resolveContractsAdress } from "./contracts";

export default {
  wallet: { clearWallet, setWallet },
  logs: { writeLog, clearLogs },
  contracts: { resolveContractsAdress }
};
