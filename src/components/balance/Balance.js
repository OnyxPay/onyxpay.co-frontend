import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import { BalanceCard } from "./Card";
import { get } from "lodash";
import { decodeAmount } from "../../utils/number";
import { OnyxCashDecimals } from "../../api/constants";
import { Button } from "antd";
import BalanceModal from "../modals/BalanceModal";

class Balance extends Component {
	state = {
		isModalVisible: false,
		balanceType: "",
	};

	showModal = balanceType => () => {
		this.setState({
			isModalVisible: true,
			balanceType: balanceType === "main" ? "main" : "reward",
		});
	};

	hideModal = () => {
		this.setState({
			isModalVisible: false,
		});
	};

	render() {
		const { balance } = this.props;
		const { isModalVisible, balanceType } = this.state;
		const onyxCashMain = get(balance, "main.onyxCash");
		const onyxCashReward = get(balance, "reward.onyxCash");
		const assetsMain = get(balance, "main.assets");
		const assetsReward = get(balance, "reward.assets");

		return (
			<div>
				<Row gutter={16}>
					<Col md={24} lg={8}>
						<BalanceCard
							label="available:"
							title="OnyxCash main"
							amount={decodeAmount(onyxCashMain, OnyxCashDecimals)}
							extra={<Button onClick={this.showModal("main")}>see detailed balance</Button>}
						/>
					</Col>
					<Col md={24} lg={8}>
						<BalanceCard
							label="available:"
							title="OnyxCash rewarded"
							amount={decodeAmount(onyxCashReward, OnyxCashDecimals)}
							extra={<Button onClick={this.showModal("reward")}>see detailed balance</Button>}
						/>
					</Col>
				</Row>
				<BalanceModal
					isModalVisible={isModalVisible}
					hideModal={this.hideModal}
					balance={
						balanceType === "main"
							? { onyxCash: decodeAmount(onyxCashMain, OnyxCashDecimals), assets: assetsMain }
							: { onyxCash: decodeAmount(onyxCashReward, OnyxCashDecimals), assets: assetsReward }
					}
				/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		balance: state.balance,
	};
}

export default connect(mapStateToProps)(Balance);
