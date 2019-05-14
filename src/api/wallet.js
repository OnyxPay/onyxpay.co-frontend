import { Account, Crypto, Wallet, utils } from "ontology-ts-sdk";
import { v4 as uuid } from "uuid";
import { Reader } from "ontology-ts-crypto";

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

export async function createWalletAccount(password) {
	const { mnemonics } = createMnemonicsAndPk();
	return await importMnemonics(mnemonics, password);
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
	currentWallet.setDefaultAccount(account.address.toBase58());

	return {
		encryptedWif: account.encryptedKey.serializeWIF(),
		wallet: currentWallet.toJson(),
		wif: privateKey.serializeWIF(),
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

export function decryptWallet(wallet, password) {
	const account = wallet.accounts[0];
	const saltHex = Buffer.from(account.salt, "base64").toString("hex");
	const encryptedKey = account.encryptedKey;
	const scrypt = wallet.scrypt;

	const pk = encryptedKey.decrypt(password, account.address, saltHex, {
		blockSize: scrypt.r,
		cost: scrypt.n,
		parallel: scrypt.p,
		size: scrypt.dkLen,
	});

	return { pk, wif: pk.serializeWIF(), wallet: wallet.toJson() };
}
