import React, { Component } from "react";
import { Input, Table, Button } from "antd";
import { connect } from "react-redux";
import { searchUser, BlockedUser } from "./../../../../redux/admin-panel/BlockedActiveUsers";
const Search = Input.Search;

class ActiveUsers extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			showTable: false,
		};
		console.log(props);
	}
	handleChange = value => {
		const { searchUser } = this.props;
		const userData = searchUser(value).then(res =>
			this.setState({
				data: res.userData,
				showTable: true,
			})
		);
		console.log(userData);
	};

	blockedUser = () => {
		const { BlockedUser } = this.props;
		BlockedUser();
	};

	render() {
		if (!this.state.data) {
			return false;
		}
		console.log(this.props);
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
						<Button type="primary" block onClick={() => this.blockedUser()}>
							Blocked
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
						<Table columns={columns} dataSource={this.state.data} />
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
		BlockedUser,
	}
)(ActiveUsers);
