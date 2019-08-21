import React, { Component } from "react";
import { Table } from "antd";

class TransactionsTable extends Component {
	state = {
		pagination: { current: 1, pageSize: 10 },
		transactionListData: [],
		loading: false,
	};

	componentDidMount = () => {
		try {
			this.fetchTransactionHistory();
			this.interval = setInterval(() => {
				this.fetchTransactionHistory({}, true);
			}, 30000);
		} catch (e) {
			console.log(e);
		}
	};

	componentWillUnmount = () => {
		clearInterval(this.interval);
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

	fetchTransactionHistory = async (opts = {}, hideLoading = false) => {
		try {
			const { pagination } = this.state;
			const { fetchData } = this.props;

			if (!hideLoading) {
				this.setState({ loading: true });
			}
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await fetchData(params);
			if (!res.error) {
				pagination.total = res.total;
				this.setState({
					pagination,
					transactionListData: res.items,
					loading: false,
				});
			}
		} catch (e) {
			this.setState({ loading: false });
			console.log(e);
		}
	};

	render() {
		const { columns, rowKey, emptyTableMessage, className = "" } = this.props;
		const classNames = ["ovf-auto", ...className.split(" ")];

		return (
			<>
				<Table
					columns={columns}
					dataSource={this.state.transactionListData}
					pagination={this.state.pagination}
					onChange={this.handleTableChange}
					rowKey={rowKey}
					locale={{ emptyText: emptyTableMessage }}
					loading={this.state.loading}
					className={classNames.join(" ")}
				/>
			</>
		);
	}
}

export default TransactionsTable;
