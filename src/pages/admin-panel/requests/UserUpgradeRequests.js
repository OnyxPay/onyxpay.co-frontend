import React, { Component } from "react";
import { Table, Button, Select, Divider, Modal } from "antd";
import ReasonToRejectUpgradeModal from "../../../components/modals/admin/ReasonToRejectUpgrade";
import { getRequests, upgradeUser, rejectRequest } from "../../../api/admin/user-upgrade";
import { TimeoutError } from "promise-timeout";
import { roles } from "api/constants";
import {
	showNotification,
	showTimeoutNotification,
	showGasCompensationError,
	showBcError,
} from "components/notification";
import { GasCompensationError, SendRawTrxError } from "utils/custom-error";

const { Option } = Select;
const { confirm } = Modal;

const style = {
	button: {
		marginRight: 8,
	},
};

const requestStatus = {
	active: "opened",
	refused: "refused",
	accepted: "closed", // request completed successfully ?
	deleted: "deleted",
	completed: "completed",
};
const initialFilters = [requestStatus.active];
const requestStatusSelectOptions = [];
for (let status in requestStatus) {
	if (requestStatus.hasOwnProperty(status)) {
		requestStatusSelectOptions.push(<Option key={requestStatus[status]}>{status}</Option>);
	}
}

function ConfirmUpgradeModalContent({ expectedPosition, user }) {
	const amount = expectedPosition && expectedPosition === roles.a ? 500 : 100000;
	return (
		<div>
			This also means on {user.wallet_addr} address will be sent <strong>{amount}</strong> OnyxCash
		</div>
	);
}

class UserUpgradeRequests extends Component {
	state = {
		isReasonToRejectModalVisible: false,
		request_id: null,
		pagination: { current: 1, pageSize: 20 },
		fetchingRequests: false,
		loadingUpgradeUser: false,
		loadingDowngradeUser: false,
		statusFilters: initialFilters,
	};

	componentDidMount = () => {
		this.fetchRequests();
	};

	handleUpgrade = async (wallet_addr, role, id) => {
		try {
			this.setState({
				loadingUpgradeUser: true,
				request_id: id,
			});
			const res = await upgradeUser(wallet_addr, role);
			if (res.Error === 0) {
				showNotification({
					type: "success",
					msg: "User was successfully upgraded",
				});
				this.fetchRequests();
			}
		} catch (e) {
			if (e instanceof GasCompensationError) {
				showGasCompensationError();
			} else if (e instanceof SendRawTrxError) {
				showBcError(e.message);
			} else if (e instanceof TimeoutError) {
				showTimeoutNotification();
			}
		}
		this.setState({
			loadingUpgradeUser: false,
		});
	};

	handleRejectRequest = async reason => {
		const { request_id } = this.state;
		const res = await rejectRequest(request_id, reason);
		if (!res.error) {
			showNotification({
				type: "Success",
				msg: `You rejected request with id ${request_id}`,
			});
			this.hideModal();
			this.fetchRequests();
		}
	};

	showModal = async request_id => {
		this.setState({
			isReasonToRejectModalVisible: true,
			request_id: request_id,
		});
	};

	hideModal = () => {
		this.setState({
			isReasonToRejectModalVisible: false,
			request_id: null,
		});
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
				this.fetchRequests({
					...filters,
				});
			}
		);
	};

	handleFilterStatusChange = statuses => {
		this.setState(
			{
				statusFilters: statuses,
			},
			() => {
				this.fetchRequests();
			}
		);
	};

	async fetchRequests(opts = {}) {
		try {
			const { pagination, statusFilters } = this.state;

			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				status: statusFilters.join(","),
				...opts,
			};
			this.setState({ fetchingRequests: true });
			const res = await getRequests(params);

			if (!res.error) {
				pagination.total = res.total;
				console.log(res.items);
				this.setState({ pagination, fetchingRequests: false, requestsData: res.items });
			}
		} catch (e) {}
	}

	showUpgradeConfirmationModal = record => {
		const that = this;
		if (record.expected_position && record.user) {
			confirm({
				title: `Are you sure you want to upgrade ${record.user.role} ${record.user.first_name} ${
					record.user.last_name
				} to ${record.expected_position} ?`,
				content: (
					<ConfirmUpgradeModalContent
						user={record.user}
						expectedPosition={record.expected_position}
					/>
				),
				okText: "Yes",
				okType: "danger",
				cancelText: "No",
				okButtonProps: { type: "primary " },
				cancelButtonProps: { type: "default " },
				onOk() {
					that.handleUpgrade(record.user.wallet_addr, record.expected_position, record.id);
				},
			});
		} else {
			return null;
		}
	};

	render() {
		const {
			isReasonToRejectModalVisible,
			pagination,
			requestsData,
			loadingUpgradeUser,
			request_id,
		} = this.state;

		const columns = [
			{
				title: "User name",
				dataIndex: "user",
				render: res => <span>{res.first_name + " " + res.last_name}</span>,
			},
			{
				title: "Registration date",
				dataIndex: "user.registered_at",
				render: res => (res ? new Date(res).toLocaleString() : "n/a"),
			},
			{
				title: "Current role",
				dataIndex: "existing_position",
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
				title: "Request creation time",
				dataIndex: "created_at",
				render: res => (res ? new Date(res).toLocaleString() : "n/a"),
			},
			{
				title: "Actions / Info",
				dataIndex: "",
				render: res => (
					<>
						{res.status === requestStatus.active ? (
							<>
								<Button
									type="primary"
									onClick={() => this.showUpgradeConfirmationModal(res)}
									style={style.button}
									loading={res.id === request_id && loadingUpgradeUser}
								>
									Confirm
								</Button>
								<Button type="danger" onClick={() => this.showModal(res.id)} style={style.button}>
									Reject
								</Button>
							</>
						) : null}
						{res.status === requestStatus.accepted ? "Request accepted" : ""}
						{res.status === requestStatus.refused ? "Refused with reason '" + res.reason + "'" : ""}
						{res.status === requestStatus.deleted ? "Request deleted" : ""}
					</>
				),
			},
		];

		return (
			<>
				<Select
					mode="multiple"
					style={{ width: "100%" }}
					placeholder="Filter requests: "
					defaultValue={initialFilters}
					onChange={this.handleFilterStatusChange}
				>
					{requestStatusSelectOptions}
				</Select>
				<Divider> </Divider>
				<Table
					columns={columns}
					rowKey={requests => requests.id}
					dataSource={requestsData}
					pagination={pagination}
					className="ovf-auto"
					onChange={this.handleTableChange}
					loading={this.state.fetchingRequests}
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

export default UserUpgradeRequests;
