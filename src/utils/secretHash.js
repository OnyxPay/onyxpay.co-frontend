import { utils } from "ontology-ts-sdk";

export function createSecret(userName, passwordHash, secretHash) {
	const hexStr = utils.str2hexstr(String.prototype.concat(userName, passwordHash));
	if (secretHash) {
		return utils.sha256(utils.sha256(hexStr));
	}
	return utils.sha256(hexStr);
}
