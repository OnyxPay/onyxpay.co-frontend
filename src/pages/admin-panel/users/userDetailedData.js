import { Modal, Table, Button, Descriptions, Divider, Form } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getUserSettlementData } from "../../../redux/admin-panel/users";
import { roleCodes } from "api/constants";
import { downgradeUser } from "api/admin/user-upgrade";
import { handleBcError } from "api/network";
import { showNotification } from "components/notification";
import { unblockUser, blockUser, isBlockedUser } from "api/admin/users";
import { convertAmountToStr } from "utils/number";

class UserDetailedData extends Component {
	state = {
		loadingSettlementData: false,
		loadingBlockUser: false,
		loadingUnblockUser: false,
		assetBalances: [],
	};

	componentDidMount = async () => {
		const { getUserSettlementData, userRecord } = this.props;
		if (userRecord.is_settlements_exists) {
			this.setState({
				loadingSettlementData: true,
			});
			await getUserSettlementData(userRecord.user_id);
			const { userSettlement } = this.props;
			this.setState({
				data: userSettlement,
				loadingSettlementData: false,
			});
		}
		if (userRecord.assets_balances !== null) {
			let balancesList = [];
			for (let asset in userRecord.assets_balances) {
				balancesList.push({
					symbol: asset,
					amount: convertAmountToStr(userRecord.assets_balances[asset], 8),
				});
			}
			this.setState({
				assetBalances: balancesList,
			});
		}
	};

	handleBlockUser = async (wallet_addr, reason, duration, userId) => {
		try {
			const { updateUserStatus } = this.props;
			this.setState({
				user_id: userId,
				loadingBlockUser: true,
			});
			await blockUser(wallet_addr, reason, duration);

			if (await isBlockedUser(wallet_addr)) {
				updateUserStatus(userId, 2);
				showNotification({
					type: "success",
					msg: "User was successfully blocked",
				});
			}
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({
				loadingBlockUser: false,
			});
		}
	};

	handleUnblockUser = async (wallet_addr, userId) => {
		try {
			const { updateUserStatus } = this.props;
			this.setState({
				user_id: userId,
				loadingUnblockUser: true,
			});
			await unblockUser(wallet_addr);
			updateUserStatus(userId, 1);
			showNotification({
				type: "success",
				msg: "User was successfully unblocked",
			});
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({
				loadingUnblockUser: false,
			});
		}
	};

	handleDowngrade = async (wallet_addr, role, id) => {
		try {
			this.setState({
				loadingDowngradeUser: true,
				request_id: id,
			});
			const res = await downgradeUser(wallet_addr, role);
			if (res.Error === 0) {
				showNotification({
					type: "success",
					msg: "User was successfully downgraded",
				});
			}
			this.fetchUsers();
		} catch (e) {
			handleBcError(e);
		}
		this.setState({
			loadingDowngradeUser: false,
		});
	};

	// res.is_settlements_exists
	render() {
		const { userRecord, userSettlement } = this.props;
		const { loadingBlockUser, loadingUnblockUser, assetBalances } = this.state;
		const settlementColumns = [
			{
				title: "Account name",
				dataIndex: "account_name",
				key: "account_name",
				width: "10%",
			},
			{
				title: "Account number",
				dataIndex: "account_number",
				key: "account_number",
				width: "10%",
				className: "nowrap-col",
			},
			{
				title: "Brief notes",
				dataIndex: "brief_notes",
				key: "brief_notes",
				width: "10%",
			},
			{
				title: "Description",
				dataIndex: "description",
				key: "description",
				width: "10%",
			},
			{
				title: "Updated",
				dataIndex: "updated_at",
				key: "updated_at",
				width: "10%",
				render: res => new Date(res).toLocaleString(),
			},
		];

		const balanceColumns = [
			{
				title: "Asset",
				dataIndex: "symbol",
				key: "symbol",
			},
			{
				title: "Balance",
				dataIndex: "amount",
				key: "amount",
			},
		];

		return (
			<>
				<Modal
					title="Detailed user info"
					visible={this.props.visible}
					onOk={() => this.props.hideModal(false)}
					onCancel={() => this.props.hideModal(false)}
					className="large-modal"
				>
					<Descriptions layout="vertical">
						<Descriptions.Item label="First Name">
							{userRecord.first_name ? userRecord.first_name : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Last name">
							{userRecord.last_name ? userRecord.last_name : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Registration date">
							{userRecord.created_at ? new Date(userRecord.created_at).toDateString() : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Role">
							{userRecord.role ? userRecord.role : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Country">
							{userRecord.country ? userRecord.country : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Email">
							{userRecord.email ? userRecord.email : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Phone number">
							{userRecord.phone_number ? userRecord.phone_number : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Chat id">
							{userRecord.chat_id ? userRecord.chat_id : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Wallet address">
							{userRecord.wallet_addr ? userRecord.wallet_addr : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Status">
							{userRecord.status ? userRecord.status : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Total remuneration">
							{userRecord.remuneration ? userRecord.remuneration : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Successful/Unsuccessful operations">
							{userRecord.hasOwnProperty("operations_successful") &&
							userRecord.hasOwnProperty("operations_unsuccessful")
								? userRecord.operations_successful + "/" + userRecord.operations_unsuccessful
								: "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Canceled customer requests">
							{userRecord.requests_canceled !== undefined ? userRecord.requests_canceled : "n/a"}
						</Descriptions.Item>
					</Descriptions>

					<Divider>Balances</Divider>
					<Table
						columns={balanceColumns}
						rowKey={data => data.symbol}
						dataSource={assetBalances}
						pagination={false}
						locale={{ emptyText: "User has no assets" }}
					/>

					<Divider>Actions</Divider>

					<Form layout="inline">
						{userRecord.status_code === 1 ? (
							<Form.Item>
								<Button
									type="danger"
									icon="user-delete"
									loading={userRecord.user_id === this.state.user_id && loadingBlockUser}
									onClick={() =>
										this.handleBlockUser(userRecord.wallet_addr, 1, 10, userRecord.user_id)
									}
								>
									Block
								</Button>
							</Form.Item>
						) : null}
						{userRecord.status_code === 2 ? (
							<Form.Item>
								<Button
									type="primary"
									icon="user-add"
									loading={userRecord.user_id === this.state.user_id && loadingUnblockUser}
									onClick={() => this.handleUnblockUser(userRecord.wallet_addr, userRecord.user_id)}
								>
									Unblock
								</Button>
							</Form.Item>
						) : null}
						{userRecord.role_code !== roleCodes.user ? (
							<Form.Item>
								<Button
									type="danger"
									onClick={() =>
										this.handleDowngrade(
											userRecord.wallet_addr,
											userRecord.role,
											userRecord.id,
											userRecord
										)
									}
								>
									Downgrade
								</Button>
							</Form.Item>
						) : null}
					</Form>

					<Divider>Settlement accounts</Divider>

					<Table
						columns={settlementColumns}
						rowKey={data => data.id}
						dataSource={userSettlement}
						className="ovf-auto"
						pagination={false}
						loading={this.state.loadingSettlementData}
						locale={{ emptyText: "User has no settlement accounts" }}
					/>
				</Modal>
			</>
		);
	}
}

const mapStateToProps = state => ({
	userSettlement: state.userSettlement,
});

export default connect(
	mapStateToProps,
	{
		unblockUser,
		getUserSettlementData,
	}
)(UserDetailedData);
