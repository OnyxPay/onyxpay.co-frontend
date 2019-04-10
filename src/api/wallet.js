import { Wallet } from "ontology-ts-sdk";

export function getWallet(walletEncoded) {
  if (walletEncoded == null) {
    throw new Error("Missing wallet data.");
  }
  return Wallet.parseJsonObj(walletEncoded);
}
