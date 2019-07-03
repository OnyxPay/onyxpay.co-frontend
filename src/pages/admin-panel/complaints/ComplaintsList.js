import React, { Component } from "react";
import { Button, Table } from "antd";

const data = [
	{
		id_request: "1",
		type_request: "1",
		name_initiator_request: "John Brown",
		name_performer_request: "John Brown",
		currency_request: "$",
		request_amount: 32,
		address: "New York No. 1 Lake Park",
		date_request_creation: "18.10.2018",
	},
	{
		id_request: "2",
		type_request: "2",
		name_initiator_request: "John Brown",
		name_performer_request: "John Brown",
		currency_request: "$",
		request_amount: 32,
		address: "New York No. 1 Lake Park",
		date_request_creation: "18.10.2018",
	},
	{
		id_request: "3",
		type_request: "3",
		name_initiator_request: "John Brown",
		name_performer_request: "John Brown",
		currency_request: "$",
		request_amount: 32,
		address: "New York No. 1 Lake Park",
		date_request_creation: "18.10.2018",
	},
];

const style = {
	button: {
		marginRight: 8,
	},
};

class ComplaintsList extends Component {
	render() {
		const columns = [
			{
				title: "Type request",
				dataIndex: "type_request",
			},
			{
				title: "Name initiator of the request",
				dataIndex: "name_initiator_request",
			},
			{
				title: "Name performer of the request",
				dataIndex: "name_performer_request",
			},
			{
				title: "Currency of the request",
				dataIndex: "currency_request",
			},
			{
				title: "Request amount",
				dataIndex: "request_amount",
			},
			{
				title: "Date and time of request creation",
				dataIndex: "date_request_creation",
			},
			{
				title: "Action",
				key: "action",
				width: "20%",
				dataIndex: "",
				render: res => (
					<>
						<Button type="danger" onClick={() => this.handleBlockAsset(res.symbol, res.key)} block>
							Start checking complaint
						</Button>
						<Button onClick={() => this.handleCheckAssetBlocked(res.symbol, res.key)} block>
							Solve a complaint in favor of the initiator
						</Button>
						<Button onClick={() => this.handleCheckAssetBlocked(res.symbol, res.key)} block>
							Solve a complaint in favor of the performer
						</Button>
					</>
				),
			},
		];

		return (
			<>
				<Table columns={columns} rowKey={data => data.id_request} dataSource={data} />
			</>
		);
	}
}
export default ComplaintsList;
