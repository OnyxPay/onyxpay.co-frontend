import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../redux/actions";
import {} from "antd";
import { PageTitle } from "../../components";

class AssetsExchange extends Component {
	render() {
		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			user: state.user,
			exchangeRates: state.assets.rates,
			wallet: state.wallet,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(AssetsExchange);
