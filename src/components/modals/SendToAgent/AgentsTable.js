import React from "react";
import { Table } from "antd";

function AgentsTable({
	data,
	loading,
	selectedRowKeys,
	onSelectedRowKeysChange,
	pagination,
	onChange,
	isSendingMessage,
}) {
	const columns = [
		{ title: "First name", dataIndex: "first_name" },
		{ title: "Last name", dataIndex: "last_name" },
		{ title: "Email", dataIndex: "email" },
		{ title: "Phone", dataIndex: "phone_number" },
		{ title: "Wallet address", dataIndex: isSendingMessage ? "wallet_addr" : "receiver.addr" },
	];

	const rowSelection = {
		type: isSendingMessage ? "checkbox" : "radio",
		selectedRowKeys,
		onChange: onSelectedRowKeysChange,
	};

	return (
		<Table
			columns={columns}
			dataSource={isSendingMessage ? data && data.items : data}
			rowKey={record => record.user_id}
			bordered
			pagination={isSendingMessage ? { ...pagination, size: "small" } : false}
			className="ovf-auto"
			loading={loading}
			rowSelection={rowSelection}
			onChange={onChange}
		/>
	);
}

export default AgentsTable;
