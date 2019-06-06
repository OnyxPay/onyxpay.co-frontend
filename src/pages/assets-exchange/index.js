import React, { Component } from "react";
import { connect } from "react-redux";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
// import { Tabs } from "antd";

// const { TabPane } = Tabs;

class AssetsExchange extends Component {
	componentDidMount() {
		const { getAssetsList } = this.props;
		getAssetsList();
	}
	render() {
		const { assets } = this.props;
		return <PageTitle>AssetsExchange</PageTitle>;
	}
}

export default connect(
	state => {
		return {
			user: state.user,
			assets: state.assets.list,
		};
	},
	{ getAssetsList: Actions.assets.getAssetsList }
)(AssetsExchange);
