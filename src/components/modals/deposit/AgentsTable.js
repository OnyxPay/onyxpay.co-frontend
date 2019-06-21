import React from "react";
import { Table } from "antd";

function AgentsTable({
	data,
	loading,
	selectedRowKeys,
	onSelectedRowKeysChange,
	pagination,
	onChange,
}) {
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
			pagination={{ ...pagination, size: "small" }}
			className="ovf-auto"
			loading={loading}
			rowSelection={rowSelection}
			onChange={onChange}
		/>
	);
}

export default AgentsTable;
