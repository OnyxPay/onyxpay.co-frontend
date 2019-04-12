import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import { BalanceCard } from "./Card";
import { get } from "lodash";
import { decodeAmount, convertAsset, addAmounts } from "../../utils/number";
import { OnyxCashDecimals } from "../../api/constants";
import { Button } from "antd";
import BalanceModal from "../modals/BalanceModal";

// TODO: extract container and view, optimize
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

	convertAssets(assets) {
		const { exchRates } = this.props;

		return assets.map(asset => {
			const rates = exchRates.find(rate => rate.symbol === asset.symbol);
			const { sell, buy } = rates;
			const { amount, symbol, key } = asset;
			const onyxCash = convertAsset({ amount, decimals: 8 }, { rate: sell, decimals: 8 });

			return {
				amount: decodeAmount(amount, 8),
				symbol,
				key,
				buy: decodeAmount(buy, 8),
				sell: decodeAmount(sell, 8),
				onyxCash,
			};
		});
	}

	calcOnyxCashTotal(arr, amount) {
		if (arr.length) {
			const result = arr.reduce((total, asset) => {
				return addAmounts(total, asset.onyxCash);
			}, 0);

			return addAmounts(result, amount);
		} else {
			return 0;
		}
	}

	render() {
		const { balance } = this.props;
		const { isModalVisible, balanceType } = this.state;
		const onyxCashMain = get(balance, "main.onyxCash");
		const onyxCashReward = get(balance, "reward.onyxCash");
		const assetsMain = get(balance, "main.assets");
		const assetsReward = get(balance, "reward.assets");

		const assetsMainConverted = this.convertAssets(assetsMain);
		const assetsRewardConverted = this.convertAssets(assetsReward);
		let onyxCashMainTotal,
			onyxCashRewardTotal = 0;

		if (
			assetsMainConverted.length &&
			assetsRewardConverted.length &&
			onyxCashMain &&
			onyxCashReward
		) {
			onyxCashMainTotal = this.calcOnyxCashTotal(
				assetsMainConverted,
				decodeAmount(onyxCashMain, OnyxCashDecimals)
			);

			onyxCashRewardTotal = this.calcOnyxCashTotal(
				assetsRewardConverted,
				decodeAmount(onyxCashReward, OnyxCashDecimals)
			);
		}

		return (
			<div>
				<Row gutter={16}>
					<Col md={24} lg={8}>
						<BalanceCard
							label="available:"
							title="OnyxCash main"
							amount={onyxCashMainTotal}
							extra={<Button onClick={this.showModal("main")}>see detailed balance</Button>}
						/>
					</Col>
					<Col md={24} lg={8}>
						<BalanceCard
							label="available:"
							title="OnyxCash rewarded"
							amount={onyxCashRewardTotal}
							extra={<Button onClick={this.showModal("reward")}>see detailed balance</Button>}
						/>
					</Col>
				</Row>
				<BalanceModal
					isModalVisible={isModalVisible}
					hideModal={this.hideModal}
					balance={
						balanceType === "main"
							? {
									onyxCash: decodeAmount(onyxCashMain, OnyxCashDecimals),
									assets: assetsMainConverted,
							  }
							: {
									onyxCash: decodeAmount(onyxCashReward, OnyxCashDecimals),
									assets: assetsRewardConverted,
							  }
					}
				/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		balance: state.balance,
		exchRates: state.exchangeRates,
	};
}

export default connect(mapStateToProps)(Balance);
