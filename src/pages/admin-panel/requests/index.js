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
	state = {
		isReasonToRejectModalVisible: false,
		reason: "",
		request_id: null,
		pagination: { current: 1, pageSize: 20 },
		loadingTable: false,
		loading: false,
	};

	confirmRole = async (wallet_addr, role, id) => {
		this.setState({
			loading: true,
			request_id: id,
		});
		const { upgradeUser } = this.props;
		if (wallet_addr && role) {
			await upgradeUser(wallet_addr, role, id);
		}
		this.setState({
			loading: false,
		});
	};

	rejectRequest = async request_id => {
		this.setState({
			isReasonToRejectModalVisible: true,
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
			isReasonToRejectModalVisible: visible,
		});
	};

	handleCancel = visible => {
		this.setState({
			isReasonToRejectModalVisible: visible,
		});
	};

	componentDidMount = async () => {
		await this.fetchRequest();
		//const { sentRequest } = this.props;
		//await sentRequest();
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
				this.fetchRequest({
					...filters,
				});
			}
		);
	};

	async fetchRequest(opts = {}) {
		try {
			const { getRequests } = this.props;
			const { pagination } = this.state;

			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				status: "opened",
				...opts,
			};

			const res = await getRequests(params);
			pagination.total = res.requestsData.total;
			this.setState({ pagination, loading: false });
		} catch (e) {}
	}

	render() {
		const { isReasonToRejectModalVisible, pagination } = this.state;
		let { requests } = this.props;
		if (!requests) {
			return null;
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
				render: res => (res ? new Date(res).toDateString() : "n/a"),
			},
			{
				title: "Current role",
				dataIndex: "user.role",
				with: "10%",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Expected role",
				dataIndex: "expected_position",
				with: "10%",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Email",
				dataIndex: "user.email",
				with: "20%",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Phone",
				dataIndex: "user.phone_number",
				with: "20%",
				render: res => (res ? res : "n/a"),
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
							loading={this.state.loading && this.state.request_id === res.id}
							onClick={() => this.confirmRole(res.user.wallet_addr, res.expected_position, res.id)}
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
						<Button onClick={() => this.rejectRequest(res)} block type="danger">
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
					pagination={{ ...pagination }}
					className="ovf-auto"
					onChange={this.handleTableChange}
					loading={this.state.loadingTable}
				/>
				{isReasonToRejectModalVisible && (
					<ReasonReject
						handleOk={this.handleOk}
						handleCancel={this.handleCancel}
						visible={isReasonToRejectModalVisible}
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
