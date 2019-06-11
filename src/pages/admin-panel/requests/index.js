import React, { Component } from "react";
import { Table, Button } from "antd";

const data = [
	{
		key: "1",
		name: "John Brown",
		data_Registration: "06.03",
		currentRole: "user",
		receivedRole: "agent",
		email: "sddfasfsdf",
		phone: "0680538893",
	},
	{
		key: "2",
		name: "John Brown",
		data_Registration: "06.03",
		currentRole: "user",
		receivedRole: "agent",
		email: "sddfasfsdf",
		phone: "0680538893",
	},
	{
		key: "3",
		name: "John Brown",
		data_Registration: "06.03",
		currentRole: "user",
		receivedRole: "agent",
		email: "sddfasfsdf",
		phone: "0680538893",
	},
	{
		key: "4",
		name: "John Brown",
		data_Registration: "06.03",
		currentRole: "user",
		receivedRole: "agent",
		email: "sddfasfsdf",
		phone: "0680538893",
	},
];

class AdminRequests extends Component {
	constructor(props) {
		super();
		this.state = {
			data: [],
		};
	}

	ConfirmRole = () => {
		alert("confirm role");
	};
	RejectRole = () => {
		prompt("", "");
	};

	render() {
		const columns = [
			{
				title: "User name",
				dataIndex: "name",
				with: "20%",
			},
			{
				title: "Date registration",
				dataIndex: "data_Registration",
				with: "15%",
			},
			{
				title: "Current role",
				dataIndex: "currentRole",
				with: "10%",
			},
			{
				title: "Received role",
				dataIndex: "receivedRole",
				with: "10%",
			},
			{
				title: "Email",
				dataIndex: "email",
				with: "20%",
			},
			{
				title: "Phone",
				dataIndex: "phone",
				with: "25%",
			},

			{
				title: "",
				render: () => (
					<>
						<Button type="primary" onClick={() => this.ConfirmRole()}>
							Confirm
						</Button>{" "}
						<Button onClick={() => this.RejectRole()} type="primary">
							Reject
						</Button>
					</>
				),
			},
		];

		return <Table columns={columns} key={data.key} dataSource={data} size="large" />;
	}
}

export default AdminRequests;
