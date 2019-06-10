import React, { Component } from "react";
import { Table, Input, Button, Icon } from "antd";
import Highlighter from "react-highlight-words";
import { connect } from "react-redux";
import Actions from "../../../redux/actions";
import UserSettlement from "./userSettlement";
import { getStore } from "../../../store";

class Users extends Component {
	constructor(props) {
		super();
		this.state = {
			searchText: "",
			data: [],
			visible: false,
			settlement: [],
			loading: false,
			user_id: null,
		};
	}

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
		onFilter: (value, record) =>
			record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
		render: text => (
			<Highlighter
				highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
				searchWords={[this.state.searchText]}
				autoEscape
				textToHighlight={text ? text.toString() : "n/a"}
			/>
		),
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	async showSettlement(dataIndex) {
		this.setState({
			loading: true,
			user_id: dataIndex,
		});
		const store = getStore();
		const { getUserSetElementData } = this.props;
		await store.dispatch(getUserSetElementData(dataIndex));
		this.setState({
			visible: true,
			loading: false,
		});
	}

	hideModal = visible => {
		this.setState({
			visible: visible,
		});
	};

	render() {
		const { loading } = this.state;
		const { adminUsers, userSettlement } = this.props;
		const columns = [
			{
				title: "First name",
				dataIndex: "first_name",
				key: "first_name",
				width: "10%",
				...this.getColumnSearchProps("first_name"),
			},
			{
				title: "Last name",
				dataIndex: "last_name",
				key: "last_name",
				width: "10%",
				...this.getColumnSearchProps("last_name"),
			},
			{
				title: "Сountry",
				dataIndex: "country",
				key: "country",
				width: "10%",
				...this.getColumnSearchProps("country"),
			},
			{
				title: "Email",
				dataIndex: "email",
				key: "email",
				width: "10%",
				...this.getColumnSearchProps("email"),
			},
			{
				title: "Phone number",
				dataIndex: "phone_number",
				key: "phone_number",
				width: "10%",
				...this.getColumnSearchProps("phone_number"),
			},
			{
				title: "Telegram Chat",
				dataIndex: "chat_id",
				key: "chat_id",
				width: "10%",
				...this.getColumnSearchProps("chat_id"),
			},
			{
				title: "Settlements accounts",
				dataIndex: "user_id",
				key: "user_id",
				width: "10%",
				...this.getColumnSearchProps("user_id"),
			} && {
				title: "Settlements accounts",
				dataIndex2: "is_settlements_exists",
				key: "is_settlements_exists",
				width: "10%",
				render: dataIndex =>
					dataIndex.is_settlements_exists ? (
						<Button
							type="primary"
							block
							icon="check"
							loading={loading && this.state.user_id === dataIndex.user_id}
							onClick={() => this.showSettlement(dataIndex.user_id)}
						>
							showSettlement
						</Button>
					) : (
						"n/a"
					),
			},
		];

		return (
			<>
				<Table columns={columns} dataSource={adminUsers} />
				{this.state.visible && (
					<UserSettlement
						hideModal={this.hideModal}
						settlementData={userSettlement}
						visible={this.state.visible}
					/>
				)}
			</>
		);
	}
}

const mapStateToProps = state => ({
	adminUsers: state.adminUsers,
	userSettlement: state.userSettlement,
});

const maoDispatchToProps = dispatch => ({
	getUsersData: dispatch(Actions.adminUsers.getUsersData()),
	getUserSetElementData: Actions.userSettlementAccountData.getUserSettlementData,
});

export default connect(
	mapStateToProps,
	maoDispatchToProps
)(Users);
