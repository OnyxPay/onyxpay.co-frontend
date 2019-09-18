import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, Tooltip, Icon } from "antd";
import { BalanceCard } from "./Card";
import { convertAmountToStr } from "utils/number";
import { OnyxCashDecimals } from "api/constants";
import BalanceModal from "../modals/BalanceModal";
import Actions from "redux/actions";
import { getRewardsBalance } from "api/balance";
import { convertAssets } from "./Balance";

class RewardsBalance extends Component {
	state = {
		isModalVisible: false,
		assetsRewards: [],
	};

	async componentDidMount() {
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

	render() {
		const { user, exchangeRates, totalRewardsBalance, assetsRewards } = this.props;
		const { isModalVisible } = this.state;
		const assetsConverted = convertAssets(assetsRewards, exchangeRates);
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
		totalRewardsBalance: state.rewards.amount ? state.rewards.amount : 0,
		assetsRewards: state.rewards.assetsRewards,
		exchangeRates: state.assets.rates,
		user: state.user,
	};
}

export default connect(
	mapStateToProps,
	{ getExchangeRates: Actions.assets.getExchangeRates }
)(RewardsBalance);
