import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Button } from "antd";
import { BalanceCard } from "./Card";
import { convertAmountToStr, convertAsset, addAmounts } from "../../utils/number";
import { OnyxCashDecimals, roles } from "../../api/constants";
import BalanceModal from "../modals/BalanceModal";

class Balance extends Component {
	state = {
		isModalVisible: false,
	};

	showModal = balanceType => () => {
		this.setState({
			isModalVisible: true,
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
			const { amount, symbol, key } = asset;
			if (rates === undefined) {
				return {
					amount: convertAmountToStr(amount, 8),
					symbol,
					key,
					buy: "n/a",
					sell: "n/a",
					asset_converted: 0,
				};
			}
			const { sell, buy } = rates;
			const asset_converted = convertAsset({ amount, decimals: 8 }, { rate: sell, decimals: 8 });
			return {
				amount: convertAmountToStr(amount, 8),
				symbol,
				key,
				buy: convertAmountToStr(buy, 8),
				sell: convertAmountToStr(sell, 8),
				asset_converted,
			};
		});
	}

	calcTotalAmount(arr, amount) {
		if (arr.length) {
			const result = arr.reduce((total, asset) => {
				return addAmounts(total, asset.asset_converted);
			}, 0);

			return addAmounts(result, amount);
		} else {
			return 0;
		}
	}

	render() {
		const { user } = this.props;
		const { assets, onyxCash } = this.props.balance;
		const { isModalVisible } = this.state;

		const assetsConverted = this.convertAssets(assets);
		let assetsTotal = 0;
		let onyxCashTotal = 0;
		let onyxCashStr = 0;

		if (onyxCash) {
			onyxCashStr = convertAmountToStr(onyxCash, OnyxCashDecimals);
		}

		if (user.role === roles.c) {
			if (assetsConverted.length) {
				assetsTotal = this.calcTotalAmount(assetsConverted, 0);
			}
		} else if (user.role === roles.a) {
			if (assetsConverted.length && onyxCash) {
				onyxCashTotal = this.calcTotalAmount(assetsConverted, onyxCashStr);
			}
		}

		return (
			<div>
				<Row gutter={16}>
					<Col md={24} lg={8}>
						<BalanceCard
							title="Balance"
							assetLabel={user.role === roles.a || user.role === roles.sa ? "OnyxCash" : "USD"}
							amount={
								user.role === roles.c
									? assetsTotal
									: user.role === roles.a
									? onyxCashTotal
									: onyxCashStr
							}
							extra={
								user.role === roles.c && user.role === roles.c ? (
									<Button onClick={this.showModal("main")}>see detailed balance</Button>
								) : null
							}
						/>
					</Col>
				</Row>
				{user.role === roles.c && user.role === roles.c ? (
					<BalanceModal
						isModalVisible={isModalVisible}
						hideModal={this.hideModal}
						balance={{
							onyxCash: onyxCashStr,
							assets: assetsConverted,
						}}
						role={user.role}
					/>
				) : null}
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		balance: state.balance,
		exchRates: state.exchangeRates,
		user: state.user,
	};
}

export default connect(mapStateToProps)(Balance);
