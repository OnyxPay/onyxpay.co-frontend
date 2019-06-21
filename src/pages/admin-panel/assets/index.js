import React, { Component } from "react";
import { Tabs } from "antd";
import BlockAssets from "./blockAsset";
import NewAssets from "./newAsset";

const { TabPane } = Tabs;

class Assets extends Component {
	state = {};

	callback(key) {}

	render() {
		return (
			<>
				<Tabs defaultActiveKey="1" onChange={this.callback}>
					<TabPane tab="Add new assets" key="1">
						<NewAssets />
					</TabPane>
					<TabPane tab="Block assets" key="2">
						<BlockAssets />
					</TabPane>
				</Tabs>
			</>
		);
	}
}

export default Assets;
