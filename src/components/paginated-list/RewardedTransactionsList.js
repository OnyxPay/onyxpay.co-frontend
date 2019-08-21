import React from "react";
import { getRewardsList } from "api/referral";
import { convertAmountToStr } from "utils/number";
import PaginatedTable from "./PaginatedTable";

let referralsTableColumns = [
	{
		title: "Date",
		dataIndex: "timestamp",
		key: "timestamp",
		render: timestamp => (timestamp ? new Date(timestamp).toLocaleString() : "n/a"),
	},
	{
		title: "Amount",
		dataIndex: "amount",
		key: "amount",
		render: amount => (amount ? convertAmountToStr(amount, 8) : "n/a"),
	},
	{
		title: "Asset",
		dataIndex: "asset",
		key: "asset",
		render: asset => (asset ? asset : "n/a"),
	},
];

function RewardedTransactionsList(props) {
	return (
		<>
			<PaginatedTable
				columns={referralsTableColumns}
				rowKey="id"
				fetchData={getRewardsList}
				emptyTableMessage="You don't have any rewarded transactions yet."
			/>
		</>
	);
}

export default RewardedTransactionsList;
