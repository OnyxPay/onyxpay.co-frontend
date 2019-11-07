import { Modal, Table, Button, Descriptions, Divider, Form, Card } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getUserSettlementData } from "../../../redux/admin-panel/users";
import { roleCodes, roles } from "api/constants";
import { downgradeUser } from "api/admin/user-upgrade";
import { handleBcError } from "api/network";
import { showNotification } from "components/notification";
import { unblockUser, blockUser, isBlockedUser } from "api/admin/users";
import { convertAmountToStr } from "utils/number";
import { updateUserStatus } from "redux/admin-panel/users";
import { MyContext } from "../../../components/layout/index";

class UserDetailedData extends Component {
	state = {
		loadingSettlementData: false,
		loadingBlockUser: false,
		loadingUnblockUser: false,
		assetBalances: [],
		settlementData: [],
	};

	componentDidMount = async () => {
		this.setSettlementData();
		this.setAssetBalances();
	};

	async componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevProps.userRecord) !== JSON.stringify(this.props.userRecord)) {
			this.setSettlementData();
			this.setAssetBalances();
		}
	}

	setSettlementData = async () => {
		const { getUserSettlementData, userRecord } = this.props;

		if (userRecord.is_settlements_exists) {
			this.setState({
				loadingSettlementData: true,
			});
			await getUserSettlementData(userRecord.user_id);
			const { userSettlement } = this.props;
			this.setState({
				settlementData: userSettlement,
				loadingSettlementData: false,
			});
		}
	};

	setAssetBalances = async () => {
		const { userRecord } = this.props;

		this.setSettlementData();
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
		} catch (e) {
			handleBcError(e);
		}
		this.setState({
			loadingDowngradeUser: false,
		});
	};

	render() {
		const { userRecord } = this.props;
		const { loadingBlockUser, loadingUnblockUser, assetBalances, settlementData } = this.state;
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

		const columnStyle = {
			width: "100%",
			textAlign: "left",
		};

		const settlementAccounts = settlementData.map((settlementAccount, index) => {
			return (
				<Card.Grid key={index} style={columnStyle}>
					<Descriptions layout="vertical">
						<Descriptions.Item label="Account name">
							{settlementAccount.account_name}
						</Descriptions.Item>
						<Descriptions.Item label="Account number">
							{settlementAccount.account_number}
						</Descriptions.Item>
						<Descriptions.Item label="Brief notes">
							{settlementAccount.brief_notes}
						</Descriptions.Item>
						<Descriptions.Item label="Description">
							{settlementAccount.description}
						</Descriptions.Item>
						<Descriptions.Item label="Updated">{settlementAccount.updated_at}</Descriptions.Item>
					</Descriptions>
				</Card.Grid>
			);
		});

		return (
			<>
				<Modal
					title="Detailed user info"
					visible={this.props.visible}
					onOk={() => this.props.hideModal(false)}
					onCancel={() => this.props.hideModal(false)}
					className="admin__user-data-modal"
				>
					<Descriptions layout="vertical">
						<Descriptions.Item label="First Name">
							{userRecord.firstName ? userRecord.firstName : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Last name">
							{userRecord.lastName ? userRecord.lastName : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Registration date">
							{userRecord.createdAt ? new Date(userRecord.createdAt).toDateString() : "n/a"}
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
							{userRecord.phoneNumber ? userRecord.phoneNumber : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Chat id">
							{userRecord.chat_id ? userRecord.chat_id : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Wallet address">
							{userRecord.walletAddr ? userRecord.walletAddr : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Status">
							{userRecord.status ? userRecord.status : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Total remuneration">
							{userRecord.remuneration ? userRecord.remuneration : "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Successful/Unsuccessful operations">
							{userRecord.count.hasOwnProperty("operations_successful") &&
							userRecord.count.hasOwnProperty("operations_unsuccessful")
								? userRecord.count.operations_successful +
								  "/" +
								  userRecord.count.operations_unsuccessful
								: "n/a"}
						</Descriptions.Item>
						<Descriptions.Item label="Canceled customer requests">
							{userRecord.requests_canceled !== undefined ? userRecord.requests_canceled : "n/a"}
						</Descriptions.Item>
					</Descriptions>

					<Divider>Balances</Divider>
					<Table
						columns={balanceColumns}
						rowKey={record => record.symbol}
						dataSource={assetBalances}
						pagination={false}
						locale={{ emptyText: "User has no assets" }}
					/>

					<Divider>Actions</Divider>
					<Form layout="inline">
						{userRecord.statusCode === 1 &&
						Number(this.props.user.roleCode) > Number(userRecord.role_code) ? (
							<Form.Item>
								<Button
									type="danger"
									icon="user-delete"
									loading={userRecord.user_id === this.state.user_id && loadingBlockUser}
									onClick={() =>
										this.handleBlockUser(userRecord.walletAddr, 1, 10, userRecord.user_id)
									}
								>
									Block
								</Button>
							</Form.Item>
						) : null}
						{userRecord.statusCode === 2 ? (
							<Form.Item>
								<Button
									type="primary"
									icon="user-add"
									loading={userRecord.user_id === this.state.user_id && loadingUnblockUser}
									onClick={() => this.handleUnblockUser(userRecord.walletAddr, userRecord.user_id)}
								>
									Unblock
								</Button>
							</Form.Item>
						) : null}
						{userRecord.role_code !== roleCodes.user && this.props.user.role !== roles.support ? (
							<Form.Item>
								<Button
									type="danger"
									onClick={() =>
										this.handleDowngrade(
											userRecord.walletAddr,
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

					<MyContext.Consumer>
						{activeBreakPoint =>
							activeBreakPoint !== "sm" && activeBreakPoint !== "xs" ? (
								<Table
									columns={settlementColumns}
									rowKey="id"
									dataSource={settlementData}
									// className="ovf-auto"
									pagination={false}
									loading={this.state.loadingSettlementData}
									locale={{ emptyText: "User has no settlement accounts" }}
								/>
							) : settlementAccounts.length ? (
								<Card>{settlementAccounts}</Card>
							) : (
								<Table locale={{ emptyText: "User has no settlement accounts" }} />
							)
						}
					</MyContext.Consumer>
				</Modal>
			</>
		);
	}
}

const mapStateToProps = state => ({
	userSettlement: state.userSettlement,
	user: state.user,
});

export default connect(
	mapStateToProps,
	{
		unblockUser,
		getUserSettlementData,
		updateUserStatus,
	}
)(UserDetailedData);
