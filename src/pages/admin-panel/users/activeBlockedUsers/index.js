import React, { Component } from "react";
import { Tabs } from "antd";
import ActiveUsers from "./active";
import BlockedUsers from "./blocked";
const { TabPane } = Tabs;

class UsersBlockedActive extends Component {
	callback = key => {
		console.log(key);
	};

	render() {
		return (
			<Tabs defaultActiveKey="1" onChange={this.callback}>
				<TabPane tab="Active users" key="1">
					<ActiveUsers />
				</TabPane>
				<TabPane tab="Blocked user" key="2">
					<BlockedUsers />
				</TabPane>
			</Tabs>
		);
	}
}

export default UsersBlockedActive;
