import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../redux/actions";
import { Row, Col } from "antd";
import { BalanceCard } from "./Card";
import { get } from "lodash";

class Balance extends Component {
	componentDidMount() {
		// const { getAssetsBalance, getOnyxCashBalance } = this.props;
		// getAssetsBalance();
		// getOnyxCashBalance();
	}

	render() {
		const { balance } = this.props;
		const onyxCashMain = get(balance, "main.onyxCash");
		const onyxCashReward = get(balance, "reward.onyxCash");
		console.log(onyxCashMain, onyxCashReward);

		return (
			<Row gutter={16}>
				<Col md={24} lg={8}>
					<BalanceCard label="available:" title="OnyxCash main" amount={onyxCashMain} />
				</Col>
				<Col md={24} lg={8}>
					<BalanceCard label="available:" title="OnyxCash rewarded" amount={onyxCashReward} />
				</Col>
			</Row>
		);
	}
}

function mapStateToProps(state) {
	return {
		balance: state.balance,
	};
}

export default connect(
	mapStateToProps,
	{
		getAssetsBalance: Actions.balance.getAssetsBalance,
		getOnyxCashBalance: Actions.balance.getOnyxCashBalance,
	}
)(Balance);
