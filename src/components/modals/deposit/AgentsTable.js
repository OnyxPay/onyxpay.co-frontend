import React, { Component } from "react";
import { Table } from "antd";

class AgentsTable extends Component {
	state = {};

	onSelectedRowKeysChange = (selectedRowKeys, selectedRows) => {
		console.log(selectedRowKeys, selectedRows);
		this.setState({ selectedRowKeys });
	};

	render() {
		const { data, loading } = this.props;
		const { selectedRowKeys } = this.state;

		const columns = [
			{ title: "First name", dataIndex: "first_name" },
			{ title: "Last name", dataIndex: "last_name" },
			{ title: "Email", dataIndex: "email" },
			{ title: "Phone", dataIndex: "phone_number" },
		];

		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectedRowKeysChange,
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
}

export default AgentsTable;
