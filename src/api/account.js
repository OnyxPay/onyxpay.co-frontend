import { getWallet } from "./wallet";

export function getAccount(wallet, getDefaultAccount) {
  if (typeof wallet === "string") {
    wallet = getWallet(wallet);
  }

  const defaultAddress = wallet.defaultAccountAddress;

  if (defaultAddress != null) {
    let account;
    // suppose we have only two accounts: main and reward
    if (getDefaultAccount) {
      // default account = main account
      account = wallet.accounts.find(a => a.address.toBase58() === defaultAddress);
    } else {
      // reward account
      account = wallet.accounts.find(a => a.address.toBase58() !== defaultAddress);
    }

    if (account === undefined) {
      throw new Error("Default account not found in wallet");
    }
    return account;
  } else {
    return wallet.accounts[0];
  }
}
