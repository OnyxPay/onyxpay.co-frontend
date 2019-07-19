import React, { Component } from "react";
import { Table } from "antd";
import { PageTitle } from "components";
import { connect } from "react-redux";
import { getRequestsComplaint } from "api/admin/complaints";

export class ResolvedComplaint extends Component {
	state = {
		data: [],
		loadingRequestData: true,
		pagination: { current: 1, pageSize: 20 },
	};

	componentDidMount = async () => {
		await this.fetchRequestResolvedComplaints({ is_complain: 1, status: "completed" });
		this.setState({
			loadingRequestData: false,
		});
	};

	async fetchRequestResolvedComplaints(opts = {}) {
		try {
			const { pagination } = this.state;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await getRequestsComplaint(params);
			console.log(res);
			this.setState({
				data: res.items,
			});
			pagination.total = res.items.total;
		} catch (e) {
			console.log(e);
		}
	}

	render() {
		const columns = [
			{
				title: "Type request",
				dataIndex: "type",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Request id",
				dataIndex: "request_id",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Winner",
				dataIndex: "asset",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Made a decision",
				dataIndex: "amount",
				render: res => (res ? res : "n/a"),
			},
		];
		return (
			<>
				<PageTitle>Resolved complaints</PageTitle>
				<Table
					columns={columns}
					loading={this.state.loadingRequestData}
					rowKey={data => data.id}
					dataSource={this.state.data}
				/>
			</>
		);
	}
}

export default connect(
	null,
	{
		getRequestsComplaint,
	}
)(ResolvedComplaint);
