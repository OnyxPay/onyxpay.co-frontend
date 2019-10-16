import { Account, Crypto, Wallet, utils } from "ontology-ts-sdk";
import { v4 as uuid } from "uuid";
import { Reader } from "ontology-ts-crypto";
import { getStore } from "../store";
import Actions from "../redux/actions";

const PrivateKey = Crypto.PrivateKey;
const KeyParameters = Crypto.KeyParameters;
const KeyType = Crypto.KeyType;
const CurveLabel = Crypto.CurveLabel;

export function getWallet(walletEncoded) {
	if (!walletEncoded) {
		throw new Error("Missing wallet data.");
	}
	return Wallet.parseJsonObj(walletEncoded);
}

export function createMnemonicsAndPk() {
	const mnemonics = utils.generateMnemonic(32);
	const wif = PrivateKey.generateFromMnemonic(mnemonics, "m/44'/888'/0'/0/0").serializeWIF();
	return { mnemonics, wif };
}

export async function createWalletAccount(password, wallet) {
	const { mnemonics } = createMnemonicsAndPk();
	return await importMnemonics(mnemonics, password, wallet);
}

export async function importPrivateKey(privateKeyStr, password, wallet) {
	let currentWallet;
	let privateKey;

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

	if (privateKeyStr.length === 52) {
		privateKey = PrivateKey.deserializeWIF(privateKeyStr);
	} else {
		privateKey = deserializePrivateKey(privateKeyStr);
	}

	const account = Account.create(privateKey, password, uuid(), scryptParams);

	currentWallet.addAccount(account);

	const res = {
		encryptedWif: account.encryptedKey.serializeWIF(),
		wallet: currentWallet.toJson(),
		wif: privateKey.serializeWIF(),
		publicKey: privateKey.getPublicKey(),
		accountAddress: account.address.toBase58(),
	};
	return res;
}

export async function setDefaultAccountAddress(wallet, privateKey, password) {
	const currentWallet = Wallet.parseJsonObj(wallet);
	const scrypt = currentWallet.scrypt;
	const scryptParams = {
		blockSize: scrypt.r,
		cost: scrypt.n,
		parallel: scrypt.p,
		size: scrypt.dkLen,
	};
	const account = Account.create(privateKey, password, scryptParams);
	currentWallet.setDefaultAccount(account.address.toBase58());
	return currentWallet.toJson();
}

export async function importMnemonics(mnemonics, password, wallet) {
	const privateKey = PrivateKey.generateFromMnemonic(mnemonics, "m/44'/888'/0'/0/0");
	const wif = privateKey.serializeWIF();
	const result = await importPrivateKey(wif, password, wallet);

	return {
		mnemonics,
		...result,
	};
}

export function deserializePrivateKey(str) {
	const b = new Buffer(str, "hex");
	const r = new Reader(b);

	if (b.length === 32) {
		// ECDSA
		const algorithm = KeyType.ECDSA;
		const curve = CurveLabel.SECP256R1;
		const sk = r.readBytes(32);
		return new PrivateKey(sk.toString("hex"), algorithm, new KeyParameters(curve));
	} else {
		const algorithmHex = r.readByte();
		const curveHex = r.readByte();
		const sk = r.readBytes(32);

		return new PrivateKey(
			sk.toString("hex"),
			KeyType.fromHex(algorithmHex),
			new KeyParameters(CurveLabel.fromHex(curveHex))
		);
	}
}

export async function decryptWallet(wallet, password) {
	const store = getStore();
	let currentWallet = getWallet(wallet);
	let account;
	store.getState().walletUnlock.currentAccountAddress
		? (account = currentWallet.accounts.filter(
				account => account.address.value === store.getState().walletUnlock.currentAccountAddress
		  )[0])
		: (account = currentWallet.accounts[0]);
	const saltHex = Buffer.from(account.salt, "base64").toString("hex");
	const encryptedKey = account.encryptedKey;
	const scrypt = currentWallet.scrypt;

	const pk = encryptedKey.decrypt(password, account.address, saltHex, {
		blockSize: scrypt.r,
		cost: scrypt.n,
		parallel: scrypt.p,
		size: scrypt.dkLen,
	});

	return {
		wallet: currentWallet.toJson(),
		pk,
		publicKey: pk.getPublicKey(),
		password,
		accountAddress: account.address,
	};
}

export async function unlockWalletAccount(account) {
	const store = getStore();
	const wallet = store.getState().wallet;
	const { password } = await store.dispatch(Actions.walletUnlock.getWalletPassword(account));
	return await decryptWallet(wallet, password);
}

export async function unlockCurrentWalletAccount() {
	const walletAddress = localStorage.getItem("OnyxAddr");
	return await unlockWalletAccount(walletAddress);
}

export function getAccount(wallet) {
	if (typeof wallet === "string") {
		wallet = getWallet(wallet);
	}

	const currentAccount = wallet.accounts.filter(
		account => account.address.value === wallet.defaultAccountAddress
	);

	return currentAccount[0];
}
