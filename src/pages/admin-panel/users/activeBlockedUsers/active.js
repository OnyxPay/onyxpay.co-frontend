import React, { Component } from "react";
import { connect } from "react-redux";
import { Input, Table, Button } from "antd";
import {
	searchUser,
	BlockUser,
	IsBlockedUser,
} from "./../../../../redux/admin-panel/BlockedActiveUsers";

const Search = Input.Search;

class ActiveUsers extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			showTable: false,
			loading: false,
		};
	}

	handleChange = value => {
		const { searchUser } = this.props;
		searchUser(value).then(res =>
			this.setState({
				data: res.userData,
				showTable: true,
			})
		);
	};

	blockedUser = async (wallet_addr, reason, duration) => {
		this.setState({
			loading: true,
		});
		const { BlockUser } = this.props;
		await BlockUser(wallet_addr, reason, duration);
		this.setState({
			loading: false,
		});
	};

	isBlockUser = wallet_addr => {
		const { IsBlockedUser } = this.props;
		IsBlockedUser(wallet_addr);
	};

	render() {
		console.log(this.props, this.state);
		const { data } = this.state;
		if (!this.state.data) {
			return false;
		}
		const columns = [
			{
				title: "First name",
				dataIndex: "first_name",
				key: "first_name",
				width: "10%",
			},
			{
				title: "Last name",
				dataIndex: "last_name",
				key: "last_name",
				width: "10%",
			},
			{
				title: "Сountry",
				dataIndex: "country",
				key: "country",
				width: "10%",
			},
			{
				title: "Email",
				dataIndex: "email",
				key: "email",
				width: "10%",
			},
			{
				title: "Phone number",
				dataIndex: "phone_number",
				key: "phone_number",
				width: "10%",
			},
			{
				title: "Telegram Chat",
				dataIndex: "chat_id",
				key: "chat_id",
				width: "10%",
			},
			{
				title: "",
				dataIndex: "",
				width: "10%",
				render: res => (
					<>
						<Button
							type="primary"
							loading={this.state.loading}
							onClick={() => this.blockedUser(res.wallet_addr, 1, 10)}
						>
							Block
						</Button>{" "}
						<Button
							type="primary"
							loading={this.state.loading}
							onClick={() => this.isBlockUser(res.wallet_addr)}
						>
							isBlocked
						</Button>
					</>
				),
			},
		];
		return (
			<>
				<Search
					placeholder="Enter account address"
					onSearch={value => this.handleChange(value)}
					enterButton
				/>
				{this.state.showTable && (
					<>
						<hr />
						<Table
							columns={columns}
							dataSource={data}
							rowKey={data => data.user_id}
							pagination={false}
						/>
					</>
				)}
			</>
		);
	}
}

export default connect(
	null,
	{
		searchUser,
		BlockUser,
		IsBlockedUser,
	}
)(ActiveUsers);
