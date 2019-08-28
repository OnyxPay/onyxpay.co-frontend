import React, { Component } from "react";
import { connect } from "react-redux";
import { Typography } from "antd";
import { convertAmountToStr } from "utils/number";
import { roles, OnyxCashDecimals } from "api/constants";
import { isEqual } from "lodash";

const { Text } = Typography;

class AvailableBalance extends Component {
	state = {
		balance: null,
		symbol: null,
	};

	componentDidMount() {
		const { assetSymbol } = this.props;
		this.handleAssetsBalance(assetSymbol);
	}

	componentDidUpdate(prevProps) {
		const { assets } = this.props.balance;
		const { assetSymbol } = this.props;

		if (!isEqual(assets, prevProps.balance.assets) || assetSymbol !== prevProps.assetSymbol) {
			this.handleAssetsBalance(assetSymbol);
		}
	}

	handleAssetsBalance = assetSymbol => {
		const { user } = this.props;
		const { assets } = this.props.balance;

		if (user.role === roles.c && assets.length) {
			assets.forEach(asset => {
				if (asset.symbol === assetSymbol) {
					this.setState({
						balance: convertAmountToStr(asset.amount, OnyxCashDecimals),
						symbol: assetSymbol,
					});
				}
			});
		}
	};

	render() {
		const { balance, symbol } = this.state;
		const { assets } = this.props.balance;

		if (!assets.length) {
			return null;
		}

		return (
			<Text strong style={{ display: "block", margin: "-12px 0px 12px" }}>
				Available balance: {balance} {symbol}
			</Text>
		);
	}
}

export default connect(state => {
	return {
		balance: state.balance,
		user: state.user,
	};
})(AvailableBalance);
