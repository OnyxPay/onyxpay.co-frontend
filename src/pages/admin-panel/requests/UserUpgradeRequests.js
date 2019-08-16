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
	deleted: "deleted",
	completed: "completed", // request completed successfully ?
	closed: "closed", // request completed successfully ?
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
			This also means on {user.walletAddr} address will be sent <strong>{amount}</strong> OnyxCash
		</div>
	);
}

class UserUpgradeRequests extends Component {
	state = {
		isReasonToRejectModalVisible: false,
		requestId: null,
		pagination: { current: 1, pageSize: 20 },
		fetchingRequests: false,
		loadingUpgradeUser: false,
		loadingDowngradeUser: false,
		statusFilters: initialFilters,
	};

	componentDidMount = () => {
		this.fetchRequests();
	};

	handleUpgrade = async (walletAddr, role, id) => {
		try {
			this.setState({
				loadingUpgradeUser: true,
				requestId: id,
			});
			const res = await upgradeUser(walletAddr, role);
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
		const { requestId } = this.state;
		const res = await rejectRequest(requestId, reason);
		if (!res.error) {
			showNotification({
				type: "success",
				msg: `You rejected request with id ${requestId}`,
			});
			this.hideModal();
			this.fetchRequests();
		}
	};

	showModal = async requestId => {
		this.setState({
			isReasonToRejectModalVisible: true,
			requestId: requestId,
		});
	};

	hideModal = () => {
		this.setState({
			isReasonToRejectModalVisible: false,
			requestId: null,
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
				this.setState({ pagination, fetchingRequests: false, requestsData: res.items });
			}
		} catch (e) {}
	}

	showUpgradeConfirmationModal = record => {
		const that = this;
		if (record.expected_position && record.user) {
			confirm({
				title: `Are you sure you want to upgrade ${record.user.role} ${record.user.firstName} ${
					record.user.lastName
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
					that.handleUpgrade(record.user.walletAddr, record.expected_position, record.id);
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
			requestId,
		} = this.state;

		const columns = [
			{
				title: "User name",
				dataIndex: "user",
				render: res => <span>{res.firstName + " " + res.lastName}</span>,
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
				dataIndex: "user.phoneNumber",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Wallet address",
				dataIndex: "user.walletAddr",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Created at",
				dataIndex: "createdAt",
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
									loading={res.id === requestId && loadingUpgradeUser}
								>
									Confirm
								</Button>
								<Button type="danger" onClick={() => this.showModal(res.id)} style={style.button}>
									Reject
								</Button>
							</>
						) : null}
						{res.status === requestStatus.completed ? "Request accepted" : ""}
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
					style={{ height: "70vh" }}
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
