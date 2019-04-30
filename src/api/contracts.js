import { getStore } from "../store";
import Actions from "../redux/actions";

export function getContractsAddress(params) {
	const store = getStore();

	let contractsName = [
		"OnyxPay",
		"Exchange",
		"InternalRevenueServiceStrategy",
		"InternalRevenueService",
		"Assets",
		"OnyxCash",
	];
	contractsName.forEach((contract, index) =>
		store.dispatch(Actions.contracts.resolveContractAddress(contract))
	);
}
