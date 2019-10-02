import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Button } from "antd";
import { BalanceCard } from "./Card";
import { convertAmountToStr, convertAsset, addAmounts } from "../../utils/number";
import { OnyxCashDecimals, roles } from "../../api/constants";
import BalanceModal from "../modals/BalanceModal";
import Actions from "../../redux/actions";

export function convertAssets(assets, exchangeRates) {
	try {
		return assets.map((asset, i) => {
			const rates = exchangeRates.find(rate => rate.symbol === asset.symbol);
			const { amount, symbol } = asset;
			if (rates === undefined) {
				return {
					amount: convertAmountToStr(amount, 8),
					symbol,
					key: i,
					buy: "n/a",
					sell: "n/a",
					asset_converted: 0,
				};
			}

			const { sell, buy } = rates;

			const assetConverted = convertAsset({ amount, decimals: 8 }, { rate: sell, decimals: 8 });
			return {
				amount: convertAmountToStr(amount, 8),
				symbol,
				key: i,
				buy: convertAmountToStr(buy, 8),
				sell: convertAmountToStr(sell, 8),
				assetConverted,
			};
		});
	} catch (e) {
		console.log(e.message);
	}
}

class Balance extends Component {
	state = {
		isModalVisible: false,
	};

	componentDidMount() {
		this.props.getExchangeRates();
	}

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

	calcTotalAmount(arr, amount = 0) {
		if (arr.length) {
			const result = arr.reduce((total, asset) => {
				return addAmounts(total, asset.assetConverted);
			}, 0);
			return addAmounts(result, amount);
		} else {
			return amount;
		}
	}

	render() {
		const { user, exchangeRates } = this.props;
		const { assets, onyxCash, depositOnyxCash } = this.props.balance;
		const { isModalVisible } = this.state;
		const oneOfValidUserRoles =
			user.role === roles.c || user.role === roles.a || user.role === roles.sa;

		const assetsConverted = convertAssets(assets, exchangeRates);
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
		} else if (user.role === roles.a || user.role === roles.sa) {
			if (assetsConverted.length || onyxCash) {
				onyxCashTotal = this.calcTotalAmount(assetsConverted, onyxCashStr);
			}
		}

		let depositBalanceFragment = <></>
		if (user.role === roles.sa) {
			depositBalanceFragment = <BalanceCard
				title="Security Deposit Balance"
				assetLabel="OnyxCash"
				amount={depositOnyxCash}
			/>
		}

		return (
			<div>
				<Row gutter={16}>
					<Col md={24} lg={10}>
						<BalanceCard
							title="Total Balance"
							assetLabel={user.role === roles.a || user.role === roles.sa ? "OnyxCash" : "USD"}
							amount={user.role === roles.c ? assetsTotal : onyxCashTotal}
							extra={
								oneOfValidUserRoles ? (
									<Button onClick={this.showModal("main")}>See detailed balance</Button>
								) : null
							}
						/>
					</Col>
					<Col md={24} lg={10}>
						{depositBalanceFragment}
					</Col>
				</Row>
				{oneOfValidUserRoles ? (
					<BalanceModal
						isModalVisible={isModalVisible}
						hideModal={this.hideModal}
						rewardBalance={false}
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
		exchangeRates: state.assets.rates,
		user: state.user,
	};
}

export default connect(
	mapStateToProps,
	{ getExchangeRates: Actions.assets.getExchangeRates }
)(Balance);
