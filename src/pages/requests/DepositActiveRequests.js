import React, { Component } from "react";
import { Table } from "antd";
import { getActiveRequests } from "../../api/deposit";

const columns = [
	{
		title: "Asset",
		dataIndex: "asset",
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
		title: "Created",
		dataIndex: "trx_timestamp",
	},
];

class DepositActiveRequests extends Component {
	state = {
		data: [],
		pagination: {},
		loading: false,
	};

	componentDidMount() {
		this.fetch();
	}

	handleTableChange = (pagination, filters, sorter) => {
		const pager = { ...this.state.pagination };
		pager.current = pagination.current;
		this.setState({
			pagination: pager,
		});
		this.fetch({
			results: pagination.pageSize,
			page: pagination.current,
			...filters,
		});
	};

	fetch = async (params = { type: "deposit" }) => {
		console.log("params:", params);
		this.setState({ loading: true });
		try {
			const data = await getActiveRequests(params);
			const pagination = { ...this.state.pagination };
			pagination.total = data.totalCount;
			pagination.total = 200;
			this.setState({
				loading: false,
				data: data.items,
				pagination,
			});
			console.log(data);
		} catch (error) {}
	};

	render() {
		return (
			<Table
				columns={columns}
				rowKey={record => record.id}
				dataSource={this.state.data}
				pagination={this.state.pagination}
				loading={this.state.loading}
				onChange={this.handleTableChange}
				className="ovf-auto tbody-white"
			/>
		);
	}
}

export default DepositActiveRequests;
