import React, { Component } from "react";
import { Table, Button } from "antd";
import { connect } from "react-redux";
import Actions from "../../../redux/actions";
import { setRequestsReject } from "../../../redux/admin-panel/requests";

const data = [
	{
		id: 1,
		statusCode: 4,
		status: "closed",
		reason: null,
		expected_position: "superagent",
		user: {
			first_name: "Nazarii",
			last_name: "Kindrat",
			registered_at: "2019-05-31T12:26:16.000Z",
			role: "user",
			email: "naza14pz@gmail.com",
			phone: "0680528857",
		},
	},
	{
		id: 2,
		statusCode: 4,
		status: "closed",
		reason: null,
		expected_position: "superagent",
		user: {
			first_name: "Nazarii",
			last_name: "Kindrat",
			registered_at: "2019-05-31T12:26:16.000Z",
			role: "user",
			email: "naza14pz@gmail.com",
			phone: "0680528857",
		},
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
	RejectRole = user_id => {
		prompt("", "");
		const reasone = "fdgdfg";
		setRequestsReject(user_id, reasone);
	};

	render() {
		const columns = [
			{
				title: "User name",
				dataIndex: "user",
				with: "20%",
				render: res => (
					<>
						<span>{res.first_name + " " + res.last_name}</span>
					</>
				),
			},
			{
				title: "Date registration",
				dataIndex: "user.registered_at",
				with: "15%",
			},
			{
				title: "Current role",
				dataIndex: "user.role",
				with: "10%",
			},
			{
				title: "Received role",
				dataIndex: "expected_position",
				with: "10%",
			},
			{
				title: "Email",
				dataIndex: "user.email",
				with: "20%",
			},
			{
				title: "Phone",
				dataIndex: "user.phone",
				with: "20%",
			},
			{
				title: "",
				dataIndex: "id",
				render: res => (
					<>
						{console.log(res)}
						<Button type="primary" onClick={() => this.ConfirmRole()}>
							Confirm
						</Button>{" "}
						<Button onClick={() => this.RejectRole(res)} type="primary">
							Reject
						</Button>
					</>
				),
			},
		];

		return <Table columns={columns} key={data.key} dataSource={data} size="large" />;
	}
}

const mapStateToProps = state => ({
	reguests: state.request,
});

export default connect(
	mapStateToProps,
	{
		requestData: Actions.adminRequests.getRequestsData,
	}
)(AdminRequests);
