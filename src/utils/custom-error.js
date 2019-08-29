import makeError from "make-error";

export const ContractAddressError = makeError("ContractAddressError");
export const SendRawTrxError = makeError("SendRawTrxError");
export const GasCompensationError = makeError("GasCompensationError");
export const UnlockWalletError = makeError("UnlockWalletError");
