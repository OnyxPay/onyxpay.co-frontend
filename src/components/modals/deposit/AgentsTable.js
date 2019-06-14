import React from "react";
import { Table } from "antd";

function AgentsTable({ data, loading }) {
	const columns = [
		{ title: "First name", dataIndex: "first_name" },
		{ title: "Last name", dataIndex: "last_name" },
		{ title: "Email", dataIndex: "email" },
		{ title: "Phone", dataIndex: "phone_number" },
	];

	return (
		<Table
			columns={columns}
			dataSource={data && data.items}
			rowKey={record => record.user_id}
			bordered
			pagination={false}
			className="ovf-auto"
			loading={loading}
		/>
	);
}

export default AgentsTable;
