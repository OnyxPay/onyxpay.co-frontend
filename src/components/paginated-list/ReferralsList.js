import React from "react";
import { getReferralsList } from "api/referral";
import PaginationTable from "./PaginationTable";

let referralsTableColumns = [
	{
		title: "First name",
		dataIndex: "firstName",
		key: "firstName",
		render: firstName => (firstName ? firstName : "n/a"),
	},
	{
		title: "Last name",
		dataIndex: "lastName",
		key: "lastName",
		render: lastName => (lastName ? lastName : "n/a"),
	},
	{
		title: "Registration date",
		dataIndex: "registrationDate",
		key: "registrationDate",
		render: registrationDate =>
			registrationDate ? new Date(registrationDate).toLocaleString() : "n/a",
	},
	{
		title: "Address",
		dataIndex: "addr",
		key: "addr",
		render: addr => (addr ? addr : "n/a"),
	},
];

function ReferralsList(props) {
	return (
		<>
			<PaginationTable
				columns={referralsTableColumns}
				rowKey={"addr"}
				fetchData={getReferralsList}
				emptyTableMessage={"You don't have any referrals yet."}
			/>
		</>
	);
}

export default ReferralsList;
