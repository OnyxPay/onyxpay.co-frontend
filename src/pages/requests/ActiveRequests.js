import React from "react";
import { Tabs } from "antd";

const { TabPane } = Tabs;

const ActiveRequests = () => {
	return (
		<div>
			<Tabs defaultActiveKey="1">
				<TabPane tab="Deposit requests" key="1">
					Content of Tab Pane 1
				</TabPane>
				<TabPane tab="Withdraw requests" key="2">
					Content of Tab Pane 2
				</TabPane>
			</Tabs>
		</div>
	);
};

export default ActiveRequests;
