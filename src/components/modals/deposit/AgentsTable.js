import React from "react";
import { Table } from "antd";

function AgentsTable({ data, loading, selectedRowKeys, onSelectedRowKeysChange }) {
	const columns = [
		{ title: "First name", dataIndex: "first_name" },
		{ title: "Last name", dataIndex: "last_name" },
		{ title: "Email", dataIndex: "email" },
		{ title: "Phone", dataIndex: "phone_number" },
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectedRowKeysChange,
	};

	return (
		<Table
			columns={columns}
			dataSource={data && data.items}
			rowKey={record => record.user_id}
			bordered
			pagination={false}
			className="ovf-auto"
			loading={loading}
			rowSelection={rowSelection}
		/>
	);
}

export default AgentsTable;
