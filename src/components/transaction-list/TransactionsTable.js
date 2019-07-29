import React, { Component } from "react";
import { Table } from "antd";

class TransactionsTable extends Component {
	state = {
		pagination: { current: 1, pageSize: 10 },
		transactionListData: [],
	};

	componentDidMount = () => {
		try {
			setInterval(() => {
				this.fetchTransactionHistory();
			}, 30000);
		} catch (e) {
			console.log(e);
		}
	};

	handleTableChange = async pagination => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				this.fetchTransactionHistory();
			}
		);
	};

	fetchTransactionHistory = async (opts = {}) => {
		try {
			const { pagination } = this.state;
			const { dataFetchFunction } = this.props;

			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await dataFetchFunction(params);
			if (!res.error) {
				pagination.total = res.total;
				this.setState({
					pagination,
					transactionListData: res.items,
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	render() {
		return (
			<>
				<Table
					columns={this.props.columns}
					dataSource={this.state.transactionListData}
					pagination={this.state.pagination}
					onChange={this.handleTableChange}
					locale={{ emptyText: "You haven't performed any exchange transactions yet." }}
				/>
			</>
		);
	}
}

export default TransactionsTable;
