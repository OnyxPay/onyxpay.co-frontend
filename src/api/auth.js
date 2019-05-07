import { Account, Crypto, utils, Wallet } from "ontology-ts-sdk";
import { v4 as uuid } from "uuid";
const PrivateKey = Crypto.PrivateKey;

export async function importPrivateKey(wif, password, wallet) {
	let currentWallet;

	if (!wallet) {
		currentWallet = Wallet.create(uuid());
	} else {
		currentWallet = Wallet.parseJsonObj(wallet);
	}
	const scrypt = currentWallet.scrypt;
	const scryptParams = {
		blockSize: scrypt.r,
		cost: scrypt.n,
		parallel: scrypt.p,
		size: scrypt.dkLen,
	};
	const privateKey = PrivateKey.deserializeWIF(wif);

	const account = Account.create(privateKey, password, uuid(), scryptParams);

	currentWallet.addAccount(account);
	currentWallet.setDefaultAccount(account.address.toBase58());

	// await storageSet("wallet", currentWallet.toJson());
	return {
		encryptedWif: account.encryptedKey.serializeWIF(),
		wallet: currentWallet.toJson(),
		wif,
	};
}

export async function importMnemonics(mnemonics, password) {
	const privateKey = PrivateKey.generateFromMnemonic(mnemonics, "m/44'/888'/0'/0/0");
	const wif = privateKey.serializeWIF();
	const result = await importPrivateKey(wif, password);

	return {
		mnemonics,
		...result,
	};
}
