import React from "react";
import { Table } from "antd";

const columns = [
	{
		title: "Address",
		dataIndex: "address",
	},
	{
		title: "Amount",
		dataIndex: "amount",
	},
	{
		title: "Status",
		dataIndex: "status",
	},
	{
		title: "Date",
		dataIndex: "date",
	},
];

const data = [];

const TransactionsTable = () => {
	return <Table columns={columns} dataSource={data} bordered className="ovf-auto" />;
};

export default TransactionsTable;
