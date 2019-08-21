import React, { Component } from "react";
import { Table, Input, Button, Icon } from "antd";
import { connect } from "react-redux";
import { getUsersData } from "redux/admin-panel/users";
import { formatUserRole } from "utils";
import UserDetailedData from "./userDetailedData";

class Users extends Component {
	state = {
		searchText: "",
		data: [],
		visible: false,
		settlement: [],
		loadingTableData: false,
		activeRecord: null,
		pagination: { current: 1, pageSize: 20 },
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
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	showDetailedUserData(userRecord) {
		this.setState({
			activeRecord: userRecord,
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

	render() {
		const { adminUsers } = this.props;
		const { loadingTableData, pagination } = this.state;
		if (!adminUsers) return null;
		const columns = [
			{
				title: "Actions",
				key: "actions",
				render: userRecord => (
					<div>
						<Button icon="account-book" onClick={() => this.showDetailedUserData(userRecord)}>
							Detailed data
						</Button>
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
				title: "Role",
				dataIndex: "role",
				key: "role",
				...this.getColumnSearchProps("role"),
				render: res => (res ? formatUserRole(res) : "n/a"),
			},
			{
				title: "Country",
				dataIndex: "country",
				key: "country",
				...this.getColumnSearchProps("country"),
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
					<UserDetailedData
						hideModal={this.hideModal}
						visible={this.state.visible}
						userRecord={this.state.activeRecord}
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
		getUsersData,
	}
)(Users);
