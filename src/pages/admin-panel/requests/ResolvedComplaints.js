import React, { Component } from "react";
import { Table } from "antd";
import { PageTitle } from "components";
import { getRequests } from "api/admin/complaints";
import { convertAmountToStr } from "utils/number";

export class ResolvedComplaint extends Component {
	state = {
		data: [],
		loadingRequestData: false,
		pagination: { current: 1, pageSize: 20 },
	};

	componentDidMount = async () => {
		this.setState({
			loadingRequestData: true,
		});
		await this.fetchRequestResolvedComplaints({ is_complain: 1, status: "completed" });
		this.setState({
			loadingRequestData: false,
		});
	};

	handleTableChange = (pagination, filters) => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				this.fetchRequestResolvedComplaints({
					...filters,
					is_complain: 1,
					status: "completed",
				});
			}
		);
	};

	async fetchRequestResolvedComplaints(opts = {}) {
		try {
			const { pagination } = this.state;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await getRequests(params);
			pagination.total = res.total;
			this.setState({
				data: res.items,
				pagination,
			});
		} catch (e) {
			console.log(e);
		}
	}

	render() {
		const { pagination } = this.state;
		const columns = [
			{
				title: "Id",
				dataIndex: "id",
			},
			{
				title: "Request type",
				dataIndex: "type",
				render: (text, record, index) => (text ? text : "n/a"),
			},
			{
				title: "Amount",
				dataIndex: "amount",
				render: (text, record, index) => (record ? convertAmountToStr(record.amount, 8) : "n/a"),
			},
			{
				title: "Winner",
				dataIndex: "complainWinner",
				render: (text, record, index) =>
					record.complainWinner ? (
						<span>
							{record.complainWinner.firstName} {record.complainWinner.lastName}
						</span>
					) : (
						"n/a"
					),
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
					onChange={this.handleTableChange}
					className="ovf-auto"
					pagination={pagination}
				/>
			</>
		);
	}
}

export default ResolvedComplaint;
