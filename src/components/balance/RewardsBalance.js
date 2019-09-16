import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, Tooltip, Icon } from "antd";
import { BalanceCard } from "./Card";
import { convertAmountToStr, convertAsset } from "../../utils/number";
import { OnyxCashDecimals } from "../../api/constants";
import BalanceModal from "../modals/BalanceModal";
import Actions from "../../redux/actions";
import { getRewardsBalance } from "api/balance";

class RewardsBalance extends Component {
	state = {
		isModalVisible: false,
		totalRewardsBalance: 0,
		assetsRewards: [],
	};

	async componentDidMount() {
		this.props.getExchangeRates();
		const res = await getRewardsBalance();
		this.setState({ totalRewardsBalance: res.totalRewards, assetsRewards: res.rewards });
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

	convertAssets(assets) {
		try {
			const { exchangeRates } = this.props;
			return assets.map((asset, i) => {
				let symbol, amount;
				symbol = Object.keys(asset)[i];
				amount = Object.values(asset)[i];

				const rates = exchangeRates.find(rate => rate.symbol === symbol);

				if (rates === undefined) {
					return {
						amount: convertAmountToStr(amount, OnyxCashDecimals),
						symbol,
						key: i,
						buy: "n/a",
						sell: "n/a",
						asset_converted: 0,
					};
				}
				const { sell, buy } = rates;
				const asset_converted = convertAsset(
					{ amount, decimals: OnyxCashDecimals },
					{ rate: sell, decimals: OnyxCashDecimals }
				);
				return {
					amount: convertAmountToStr(amount, OnyxCashDecimals),
					symbol,
					key: i,
					buy: convertAmountToStr(buy, OnyxCashDecimals),
					sell: convertAmountToStr(sell, OnyxCashDecimals),
					asset_converted,
				};
			});
		} catch (e) {
			console.log(e.message);
		}
	}

	render() {
		const { user } = this.props;
		const { isModalVisible, totalRewardsBalance, assetsRewards } = this.state;
		const assetsConverted = this.convertAssets(assetsRewards);

		return (
			<div>
				<Row gutter={16}>
					<Col md={24} lg={10}>
						<BalanceCard
							title={
								<>
									Total rewards
									<Tooltip
										title="The balance of rewards is included in the total balance."
										placement="bottom"
										overlayStyle={{ maxWidth: 400 }}
									>
										<Icon
											type="info-circle"
											style={{ marginLeft: 5, marginTop: 10, fontSize: 18 }}
										/>
									</Tooltip>
								</>
							}
							assetLabel={"OnyxCash"}
							amount={convertAmountToStr(totalRewardsBalance, OnyxCashDecimals)}
							extra={<Button onClick={this.showModal("main")}>See detailed balance</Button>}
						/>
					</Col>
				</Row>
				<BalanceModal
					isModalVisible={isModalVisible}
					hideModal={this.hideModal}
					balance={{
						assets: assetsConverted,
					}}
					role={user.role}
				/>
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
)(RewardsBalance);
