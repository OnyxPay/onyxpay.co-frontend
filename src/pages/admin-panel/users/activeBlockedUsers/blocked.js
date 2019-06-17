import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, Button } from "antd";
import { UnblockUser, BlockedUsersData } from "./../../../../redux/admin-panel/BlockedActiveUsers";

const data = [
	{
		key: "1",
		name: "John Brown",
		age: 32,
		address: "New York No. 1 Lake Park",
	},
	{
		key: "2",
		name: "Jim Green",
		age: 42,
		address: "London No. 1 Lake Park",
	},
	{
		key: "3",
		name: "Joe Black",
		age: 32,
		address: "Sidney No. 1 Lake Park",
	},
];

class BlockedUsers extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	unblockUser = wallet_addr => {
		const { UnblockUser } = this.props;
		UnblockUser(wallet_addr);
	};

	componentDidMount() {
		//const { BlockedUsersData } = this.props;
		//BlockedUsersData();
	}

	render() {
		const columns = [
			{
				title: "Name",
				dataIndex: "name",
			},
			{
				title: "Age",
				dataIndex: "age",
			},
			{
				title: "Address",
				dataIndex: "address",
			},
			{
				title: "",
				dataIndex: "",
				width: "10%",
				render: res => (
					<>
						<Button type="primary" block onClick={() => this.unblockUser(res.wallet_addr)}>
							Unblock
						</Button>
					</>
				),
			},
		];
		return <Table columns={columns} dataSource={data} size="middle" />;
	}
}

export default connect(
	null,
	{
		UnblockUser,
		BlockedUsersData,
	}
)(BlockedUsers);
