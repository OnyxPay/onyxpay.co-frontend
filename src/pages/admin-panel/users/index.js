import React, { Component } from "react";
import { Table, Input, Button, Icon } from "antd";
import { connect } from "react-redux";
import UserSettlement from "./userSettlement";
import { roleCodes } from "api/constants";
import { blockedUsersData, getUsersData, updateUserStatus } from "redux/admin-panel/users";
import { unblockUser, blockUser, isBlockedUser } from "api/admin/users";
import { convertAmountToStr } from "utils/number";
import { downgradeUser } from "api/admin/user-upgrade";
import { handleBcError } from "api/network";
import { showNotification } from "components/notification";
import { formattingRoleUser } from "components/layout/User";

class Users extends Component {
	state = {
		searchText: "",
		data: [],
		visible: false,
		settlement: [],
		loadingTableData: false,
		user_id: null,
		pagination: { current: 1, pageSize: 20 },
		loadingBlockUser: false,
		loadingUnblockUser: false,
	};

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={node => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{ width: 90, marginRight: 8 }}
				>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => (
			<Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
		),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
	});

	handleSearch = (selectedKeys, confirm) => {
		debugger;
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	showSettlement(dataIndex) {
		this.setState({
			user_id: dataIndex,
			visible: true,
		});
	}

	hideModal = visible => {
		this.setState({
			visible: visible,
		});
	};

	componentDidMount = async () => {
		await this.fetchUsers();
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
				for (const filter in filters) {
					filters[filter] = filters[filter][0];
				}
				this.fetchUsers(filters);
			}
		);
	};

	async fetchUsers(opts = {}) {
		try {
			this.setState({ loadingTableData: true });
			const { getUsersData } = this.props;
			const { pagination } = this.state;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await getUsersData(params);
			pagination.total = res.adminUsers.total;
			this.setState({ pagination, loadingTableData: false });
		} catch (e) {}
	}

	handleBlockUser = async (walletAddr, reason, duration, userId) => {
		try {
			const { updateUserStatus } = this.props;
			this.setState({
				user_id: userId,
				loadingBlockUser: true,
			});
			await blockUser(walletAddr, reason, duration);

			if (await isBlockedUser(walletAddr)) {
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

	handleUnblockUser = async (walletAddr, userId) => {
		try {
			const { updateUserStatus } = this.props;
			this.setState({
				user_id: userId,
				loadingUnblockUser: true,
			});
			await unblockUser(walletAddr);
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

	handleDowngrade = async (walletAddr, role, id) => {
		try {
			this.setState({
				loadingDowngradeUser: true,
				requestId: id,
			});
			const res = await downgradeUser(walletAddr, role);
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

	render() {
		const { adminUsers } = this.props;
		const { loadingTableData, pagination, loadingBlockUser, loadingUnblockUser } = this.state;
		if (!adminUsers) return null;
		const columns = [
			{
				title: "Actions",
				render: res => (
					<div>
						{res.statusCode === 1 ? (
							<Button
								type="danger"
								icon="user-delete"
								loading={res.user_id === this.state.user_id && loadingBlockUser}
								onClick={() => this.handleBlockUser(res.walletAddr, 1, 10, res.user_id)}
							>
								Block
							</Button>
						) : null}
						{res.statusCode === 2 ? (
							<Button
								type="primary"
								icon="user-add"
								loading={res.user_id === this.state.user_id && loadingUnblockUser}
								onClick={() => this.handleUnblockUser(res.walletAddr, res.user_id)}
							>
								Unblock
							</Button>
						) : null}
						{res.role_code !== roleCodes.user ? (
							<Button
								type="danger"
								onClick={() => this.handleDowngrade(res.walletAddr, res.role, res.id, res)}
							>
								Downgrade
							</Button>
						) : null}
						{res.is_settlements_exists ? (
							<Button icon="account-book" onClick={() => this.showSettlement(res.user_id)}>
								Settlement accounts
							</Button>
						) : null}
					</div>
				),
			},
			{
				title: "First name",
				dataIndex: "firstName",
				key: "firstName",
				...this.getColumnSearchProps("firstName"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Last name",
				dataIndex: "lastName",
				key: "lastName",
				...this.getColumnSearchProps("lastName"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Registration date",
				dataIndex: "createdAt",
				key: "createdAt",
				...this.getColumnSearchProps("createdAt"),
				render: res => (res ? new Date(res).toDateString() : "n/a"),
			},
			{
				title: "Role",
				dataIndex: "role",
				key: "role",
				...this.getColumnSearchProps("role"),
				render: res => (res ? formattingRoleUser(res) : "n/a"),
			},
			{
				title: "Country",
				dataIndex: "country",
				key: "country",
				...this.getColumnSearchProps("country"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Email",
				dataIndex: "email",
				key: "email",
				...this.getColumnSearchProps("email"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Phone number",
				dataIndex: "phoneNumber",
				key: "phoneNumber",
				...this.getColumnSearchProps("phoneNumber"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Balances",
				dataIndex: "assets_balances",
				key: "assets_balances",
				...this.getColumnSearchProps("assets_balances"),
				render: res => {
					let balances = "";
					for (let asset in res) {
						balances += asset + ": " + convertAmountToStr(res[asset], 8) + "\n";
					}

					return balances;
				},
			},
			{
				title: "Chat id",
				dataIndex: "chat_id",
				key: "chat_id",
				...this.getColumnSearchProps("chat_id"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Wallet address",
				dataIndex: "walletAddr",
				key: "walletAddr",
				...this.getColumnSearchProps("walletAddr"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				...this.getColumnSearchProps("status"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Total remuneration",
				dataIndex: "remuneration",
				key: "remuneration",
				...this.getColumnSearchProps("remuneration"),
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Other data",
				dataIndex: "count",
				key: "count",
				undefined,
				render: res => {
					if (
						res.hasOwnProperty("operations_successful") &&
						res.hasOwnProperty("operations_unsuccessful")
					) {
						return (
							"Number of successful/unsuccessful operations: " +
							res.operations_successful +
							"/" +
							res.operations_unsuccessful
						);
					}
					if (res.requests_canceled !== undefined) {
						return "Number of canceled customer requests: " + res.requests_canceled;
					}
					return "";
				},
			},
		];

		return (
			<>
				<Table
					columns={columns}
					rowKey={record => record.user_id}
					dataSource={adminUsers}
					className="usersTable ovf-auto"
					onChange={this.handleTableChange}
					pagination={{ ...pagination }}
					loading={loadingTableData}
				/>
				{this.state.visible && (
					<UserSettlement
						hideModal={this.hideModal}
						visible={this.state.visible}
						userId={this.state.user_id}
					/>
				)}
			</>
		);
	}
}

const mapStateToProps = state => ({
	adminUsers: state.adminUsers,
});

export default connect(
	mapStateToProps,
	{
		unblockUser,
		blockedUsersData,
		getUsersData,
		updateUserStatus,
	}
)(Users);
