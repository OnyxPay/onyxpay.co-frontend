import React, { Component } from "react";
import { Table, Button, notification } from "antd";
import { connect } from "react-redux";
import {
	rejectRequest,
	sentRequest,
	upgradeUser,
	getRequests,
} from "../../../redux/admin-panel/requests";
import ReasonToRejectUpgradeModal from "../../../components/modals/admin/ReasonToRejectUpgrade";

const style = {
	button: {
		marginRight: 8,
	},
};
class AdminRequests extends Component {
	state = {
		isReasonToRejectModalVisible: false,
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

	showModal = async request_id => {
		this.setState({
			isReasonToRejectModalVisible: true,
			request_id: request_id,
		});
	};

	handleRejectRequest = async reason => {
		const { request_id } = this.state;
		const { rejectRequest } = this.props;

		const res = await rejectRequest(request_id, reason);
		if (!res.error) {
			notification.success({
				message: "Done",
				description: `You rejected request with id ${request_id}`,
			});
			this.hideModal();
		}
		console.log(res);
	};

	hideModal = () => {
		this.setState({
			isReasonToRejectModalVisible: false,
			request_id: null,
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
				render: res => <span>{res.first_name + " " + res.last_name}</span>,
			},
			{
				title: "Date registration",
				dataIndex: "user.registered_at",
				render: res => (res ? new Date(res).toLocaleString() : "n/a"),
			},
			{
				title: "Current role",
				dataIndex: "user.role",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Expected role",
				dataIndex: "expected_position",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Email",
				dataIndex: "user.email",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Phone",
				dataIndex: "user.phone_number",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Wallet address",
				dataIndex: "user.wallet_addr",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Actions",
				dataIndex: "",
				render: res => (
					<>
						<Button
							type="primary"
							loading={this.state.loading && this.state.request_id === res.id}
							onClick={() => this.confirmRole(res.user.wallet_addr, res.expected_position, res.id)}
							style={style.button}
						>
							Confirm
						</Button>
						<Button onClick={() => this.showModal(res.id)} type="danger" style={style.button}>
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
					pagination={pagination}
					className="ovf-auto"
					onChange={this.handleTableChange}
					loading={this.state.loadingTable}
				/>
				{isReasonToRejectModalVisible && (
					<ReasonToRejectUpgradeModal
						handleRejectRequest={this.handleRejectRequest}
						hideModal={this.hideModal}
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
		rejectRequest,
		sentRequest,
		upgradeUser,
	}
)(AdminRequests);
