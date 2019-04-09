import { writeLog, clearLogs } from "./logs";
import { setWallet, clearWallet } from "./wallet";
import { resolveContractsAdress } from "./contracts";
import { getAssetsBalance } from "./balance";

export default {
  wallet: { clearWallet, setWallet },
  logs: { writeLog, clearLogs },
  contracts: { resolveContractsAdress },
  balance: { getAssetsBalance }
};
