import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "antd";

const exchangeHistoryColumns = [
	{
		title: "Transaction Hash",
		dataIndex: "transactionHash",
		key: "transactionHash",
		width: "9em",
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

class ExchangeHistory extends Component {
	render() {
		return (
			<>
				<Table
					columns={exchangeHistoryColumns}
					// dataSource={this.state.assetsForSellData}
					// pagination={false}
					// scroll={{ y: "16em" }}
					locale={{ emptyText: "You haven't performed any exchange transactions yet." }}
				/>
			</>
		);
	}
}

export default connect()(ExchangeHistory);
