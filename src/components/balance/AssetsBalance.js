import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "antd";
import { convertAmountToStr } from "utils/number";
import { roles, onyxCashSymbol, OnyxCashDecimals } from "api/constants";

const assetsColumns = [
	{
		title: "Asset name",
		dataIndex: "name",
		key: "name",
		width: "50%",
	},
	{
		title: "Balance",
		dataIndex: "balance",
		key: "balance",
		width: "50%",
	},
];

class AssetsBalance extends Component {
	state = {
		loadingAssetBalanceData: false,
		assetsData: [],
	};

	componentDidMount() {
		this.setState({
			loadingAssetBalanceData: true,
		});
		this.handleAssetsBalance();
	}

	componentDidUpdate(prevProps) {
		const { assets, onyxCash } = this.props.balance;
		if (
			onyxCash !== prevProps.balance.onyxCash ||
			assets.length !== prevProps.balance.assets.length
		) {
			this.handleAssetsBalance();
		}
	}

	handleAssetsBalance = () => {
		const { user } = this.props;
		const { assets, onyxCash } = this.props.balance;
		let assetsData = [];
		console.log(onyxCash, assets);
		if ((user.role === roles.a && onyxCash) || (user.role === roles.sa && onyxCash)) {
			assetsData.push({
				key: onyxCashSymbol,
				name: onyxCashSymbol,
				balance: convertAmountToStr(onyxCash, OnyxCashDecimals),
			});
			assets.map(asset =>
				assetsData.push({
					key: asset.key,
					name: asset.symbol,
					balance: convertAmountToStr(asset.amount, OnyxCashDecimals),
				})
			);
			this.setState({
				loadingAssetBalanceData: false,
			});
		}
		if (user.role === roles.c && assets) {
			assets.map(asset =>
				assetsData.push({
					key: asset.key,
					name: asset.symbol,
					balance: convertAmountToStr(asset.amount, OnyxCashDecimals),
				})
			);
			this.setState({
				loadingAssetBalanceData: false,
			});
		}
		this.setState({
			assetsData,
		});
	};

	render() {
		const { assetsData, loadingAssetBalanceData } = this.state;
		if (!assetsData) {
			return false;
		}
		return (
			<Table
				columns={assetsColumns}
				dataSource={assetsData}
				pagination={false}
				scroll={{ y: "16em" }}
				style={{ marginBottom: "20px" }}
				loading={loadingAssetBalanceData}
			/>
		);
	}
}

export default connect(state => {
	return {
		balance: state.balance,
		user: state.user,
	};
})(AssetsBalance);
