import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "antd";
import { getExchangeHistory } from "../../api/transactions-history";

class ExchangeHistory extends Component {
	state = {
		pagination: { current: 1, pageSize: 20 },
		fetchingExchangeHistory: false,
	};

	componentDidMount = () => {
		this.fetchTransactionHistory();
		// for testing purposes
		// createRequest();
	};

	handleTableChange = async pagination => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			}
			// () => {
			// this.fetchRequests({
			// 	...filters,
			// });
			// }
		);
	};

	fetchTransactionHistory = async (opts = {}) => {
		try {
			const { pagination, statusFilters } = this.state;

			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			this.setState({ fetchingExchangeHistory: true });
			const res = await getExchangeHistory(params);

			if (!res.error) {
				pagination.total = res.total;
				this.setState({ pagination, fetchingExchangeHistory: false, requestsData: res.items });
			}
		} catch (e) {}
	};

	render() {
		const { pagination, exchangeHistoryData } = this.state;

		const exchangeHistoryColumns = [
			{
				title: "Transaction Hash",
				dataIndex: "transactionHash",
				key: "transactionHash",
				width: "9em",
				render: res => {
					"kek";
				},
			},
			{
				title: "Date",
				dataIndex: "date",
				key: "date",
				width: "9em",
			},
			{
				title: "Sold asset",
				dataIndex: "soldAsset",
				key: "soldAsset",
				width: "9em",
			},
			{
				title: "Bought Asset",
				dataIndex: "boughtAsset",
				key: "boughtAsset",
				width: "9em",
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				width: "9em",
			},
		];

		return (
			<>
				<Table
					columns={exchangeHistoryColumns}
					dataSource={exchangeHistoryData}
					pagination={pagination}
					onChange={this.handleTableChange}
					loading={this.state.fetchingExchangeHistory}
					locale={{ emptyText: "You haven't performed any exchange transactions yet." }}
				/>
			</>
		);
	}
}

export default connect()(ExchangeHistory);
