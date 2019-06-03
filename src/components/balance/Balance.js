import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import { BalanceCard } from "./Card";
import { get } from "lodash";
import { convertAmountToStr, convertAsset, addAmounts } from "../../utils/number";
import { OnyxCashDecimals } from "../../api/constants";
import { Button } from "antd";
import BalanceModal from "../modals/BalanceModal";

// TODO: extract container and view, optimize
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
					onyxCash: 0,
				};
			}
			const { sell, buy } = rates;
			const onyxCash = convertAsset({ amount, decimals: 8 }, { rate: sell, decimals: 8 });
			return {
				amount: convertAmountToStr(amount, 8),
				symbol,
				key,
				buy: convertAmountToStr(buy, 8),
				sell: convertAmountToStr(sell, 8),
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
		const { assets, onyxCash } = this.props.balance;
		const { isModalVisible } = this.state;

		const assetsConverted = this.convertAssets(assets);

		let onyxCashTotal = 0;

		if (assetsConverted.length && onyxCash) {
			onyxCashTotal = this.calcOnyxCashTotal(
				assetsConverted,
				convertAmountToStr(onyxCash, OnyxCashDecimals)
			);
		}

		return (
			<div>
				<Row gutter={16}>
					<Col md={24} lg={8}>
						<BalanceCard
							label="available:"
							title="OnyxCash"
							amount={onyxCashTotal}
							extra={<Button onClick={this.showModal("main")}>see detailed balance</Button>}
						/>
					</Col>
				</Row>
				<BalanceModal
					isModalVisible={isModalVisible}
					hideModal={this.hideModal}
					balance={{
						onyxCash: convertAmountToStr(onyxCash, OnyxCashDecimals),
						assets: assetsConverted,
					}}
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
