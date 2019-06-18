import React, { Component } from "react";
import { Table, Button } from "antd";
import { connect } from "react-redux";
import {
	setRequestReject,
	sentRequest,
	upgradeUser,
	getRequests,
} from "../../../redux/admin-panel/requests";
import ReasonReject from "./reasonReject";

class AdminRequests extends Component {
	constructor(props) {
		super();
		this.state = {
			visible: false,
			reason: "",
			request_id: null,
		};
	}

	ConfirmRole = (wallet_addr, role, id) => {
		const { upgradeUser } = this.props;
		if (wallet_addr && role) {
			upgradeUser(wallet_addr, role, id);
		}
	};

	RejectRequest = async request_id => {
		this.setState({
			visible: true,
			request_id: request_id,
		});
	};

	handleChange = event => {
		this.setState({ reason: event.target.value });
	};

	handleOk = visible => {
		const { request_id, reason } = this.state;
		const { setRequestReject } = this.props;
		setRequestReject(request_id, reason);
		this.setState({
			visible: visible,
		});
	};

	handleCancel = visible => {
		this.setState({
			visible: visible,
		});
	};

	componentDidMount = async () => {
		const { getRequests } = this.props;
		await getRequests();
		//const { sentRequest } = this.props;
		//await sentRequest();
	};

	render() {
		const { visible } = this.state;
		let { requests } = this.props;
		if (!requests) {
			return false;
		}
		requests = requests.filter(rq => rq.status !== "refused");
		const columns = [
			{
				title: "User name",
				dataIndex: "user",
				with: "20%",
				render: res => <>{res.first_name + " " + res.last_name}</>,
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
				title: "Expected role",
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
				dataIndex: "user.phone_number",
				with: "20%",
			},
			{
				title: "",
				dataIndex: "",
				with: "10%",
				render: res => (
					<>
						<Button
							type="primary"
							block
							onClick={() => this.ConfirmRole(res.user.wallet_addr, res.expected_position, res.id)}
						>
							Confirm
						</Button>
					</>
				),
			},
			{
				title: "",
				dataIndex: "id",
				render: res => (
					<>
						<Button onClick={() => this.RejectRequest(res)} block type="primary">
							Reject
						</Button>
					</>
				),
			},
		];

		return (
			<>
				<Table
					columns={columns}
					rowKey={requests => requests.id}
					dataSource={requests}
					size="large"
				/>
				{visible && (
					<ReasonReject
						handleOk={this.handleOk}
						handleCancel={this.handleCancel}
						visible={visible}
						handleChange={this.handleChange}
					/>
				)}
			</>
		);
	}
}

const mapStateToProps = state => ({
	requests: state.adminRequest,
});

export default connect(
	mapStateToProps,
	{
		getRequests,
		setRequestReject,
		sentRequest,
		upgradeUser,
	}
)(AdminRequests);
