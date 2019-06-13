import React, { Component } from "react";
import { Table, Button, Icon } from "antd";
import { getActiveRequests } from "../../api/requests";
import CancelRequest from "./CancelRequest";

const style = {
	btn: {
		marginRight: 8,
	},
};

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
	{
		title: "Action",
		render: (text, record, index) => {
			return (
				<>
					<Button style={style.btn}>Send to agents</Button>
					<CancelRequest btnStyle={style.btn} requestId="123" />
				</>
			);
		},
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
		const plug = [
			{
				asset: "oUSD",
				amount: 1000,
				status: "active",
				id: 1,
			},
		];
		this.setState({ loading: true });
		try {
			const data = await getActiveRequests(params);
			const pagination = { ...this.state.pagination };
			pagination.total = data.totalCount;
			pagination.total = 200;
			this.setState({
				loading: false,
				data: plug,
				pagination,
			});
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
