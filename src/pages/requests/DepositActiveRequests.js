import React, { Component } from "react";
import { Table } from "antd";
import reqwest from "reqwest";
import { getActiveRequests } from "../../api/deposit";

const columns = [
	{
		title: "Name",
		dataIndex: "name",
		sorter: true,
		render: name => `${name.first} ${name.last}`,
		width: "20%",
	},
	{
		title: "Gender",
		dataIndex: "gender",
		filters: [{ text: "Male", value: "male" }, { text: "Female", value: "female" }],
		width: "20%",
	},
	{
		title: "Email",
		dataIndex: "email",
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
			sortField: sorter.field,
			sortOrder: sorter.order,
			...filters,
		});
	};

	fetch = async (params = {}) => {
		console.log("params:", params);
		this.setState({ loading: true });
		try {
			const data = await getActiveRequests(params);
			const pagination = { ...this.state.pagination };
			pagination.total = data.totalCount;
			pagination.total = 200;
			this.setState({
				loading: false,
				data: data.results,
				pagination,
			});
			console.log(data);
		} catch (error) {}
	};

	render() {
		return (
			<Table
				columns={columns}
				rowKey={record => record.login.uuid}
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
