import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Table, Icon } from "antd";
import Actions from "redux/actions";
import { blockAsset } from "api/admin/assets";
import AddNewAsset from "components/modals/admin/AddNewAsset";
import SetExchangeRates from "components/modals/admin/SetExchangeRates";
import { showNotification } from "components/notification";
import { convertAmountToStr } from "utils/number";
import { getAssetsData } from "api/assets";
import { getColumnSearchProps, getOnColumnFilterProp } from "components/table/common";
import { handleBcError } from "api/network";

const modals = {
	ADD_ASSETS_MODAL: "ADD_ASSETS_MODAL",
	ADD_SET_EXCHANGE_RATES: "ADD_SET_EXCHANGE_RATES",
};

const style = {
	button: {
		marginRight: 10,
	},
};

function sortValues(valA, valB) {
	if (valA < valB) {
		return -1;
	}
	if (valA > valB) {
		return 1;
	}
	return 0;
}

function renderExchangeRate(record, exchangeRates, name) {
	let res;
	for (let i = 0; i < exchangeRates.length; i++) {
		if (exchangeRates[i].symbol === record.symbol) {
			if (name === "buy") {
				res = convertAmountToStr(exchangeRates[i].buy, 8);
			} else if (name === "sell") {
				res = convertAmountToStr(exchangeRates[i].sell, 8);
			}
			break;
		}
	}
	if (!res) {
		return "n/a";
	}
	return res;
}

class AssetsList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loadingBlockedAsset: false,
			ADD_ASSETS_MODAL: false,
			ADD_SET_EXCHANGE_RATES: false,
			pagination: { pageSize: 20 },
			symbolKey: null,
			tokenId: null,
			assetsStatus: null,
			disableBtn: false,
		};
	}

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	async componentDidMount() {
		const { getAssetsList, getExchangeRates } = this.props;
		getExchangeRates();
		getAssetsList();
		const assetsData = await getAssetsData();
		this.setState({
			assetsStatus: assetsData,
		});
	}

	showModalAddAsset = type => () => {
		this.setState({ ADD_ASSETS_MODAL: true });
	};

	hideModalAddAsset = type => () => {
		this.setState({ ADD_ASSETS_MODAL: false });
	};

	showModalSetExchangeRates = (type, symbol) => () => {
		let buyPrice, sellPrice;
		let { exchangeRates } = this.props;

		for (let item of exchangeRates) {
			if (item.symbol === symbol) {
				buyPrice = item.buy;
				sellPrice = item.sell;
				break;
			}
		}

		this.setState({ tokenId: symbol, buyPrice, sellPrice, ADD_SET_EXCHANGE_RATES: true });
	};

	hideModalSetExchangeRates = type => () => {
		this.setState({ ADD_SET_EXCHANGE_RATES: false });
	};

	handleBlockAsset = async (asset_symbol, key) => {
		this.setState({
			symbolKey: key,
			loadingBlockedAsset: true,
		});
		try {
			const res = await blockAsset(asset_symbol);
			if (res.Error === 0) {
				showNotification({
					type: "success",
					msg: "Asset was successfully blocked",
				});
				this.setState({
					disableBtn: true,
				});
			}
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({
				loadingBlockedAsset: false,
			});
		}
	};

	checkAssetStatus = symbol => {
		const { assetsStatus } = this.state;
		const { data } = this.props;
		let res, status;
		if (assetsStatus !== null) {
			for (let i = 0; i < assetsStatus.length; i++) {
				if (assetsStatus[i].name === symbol) {
					res = assetsStatus[i].status;
					if (res === 1) {
						status = "active";
					} else {
						status = "blocked";
					}
					break;
				}
			}
		}

		for (let i = 0; i < data.length; i++) {
			if (data[i].symbol === symbol) {
				data[i].status = status;
				break;
			}
		}
		if (!status) {
			return "n/a";
		}
		return status;
	};

	refreshTable = async () => {
		const { getAssetsList } = this.props;
		getAssetsList();
		const assetsData = await getAssetsData();
		this.setState({
			assetsStatus: assetsData,
		});
	};

	render() {
		const {
			disableBtn,
			pagination,
			loadingBlockedAsset,
			symbolKey,
			ADD_ASSETS_MODAL,
			ADD_SET_EXCHANGE_RATES,
			tokenId,
			buyPrice,
			sellPrice,
		} = this.state;
		const {
			data,
			exchangeRates,
			loadingAssetsList,
			loadingExchangeRates,
			getExchangeRates,
			getAssetsList,
		} = this.props;
		if (!data.length && !exchangeRates.length) {
			return null;
		}
		const columns = [
			{
				title: "Assets name",
				key: "symbol",
				width: "15%",
				dataIndex: "symbol",
				sorter: (a, b) => {
					const nameA = a.symbol.toLowerCase();
					const nameB = b.symbol.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["ascend", "descend"],
				...getColumnSearchProps()("symbol"),
				...getOnColumnFilterProp("symbol"),
			},
			{
				title: "Buy price",
				dataIndex: "",
				key: "buyPrice",
				width: "20%",
				render: record => renderExchangeRate(record, exchangeRates, "buy"),
			},
			{
				title: "Sell price",
				dataIndex: "",
				key: "sell",
				width: "20%",
				render: record => renderExchangeRate(record, exchangeRates, "sell"),
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				width: "20%",
				render: (text, record, index) => this.checkAssetStatus(record.symbol),
			},
			{
				title: "Action",
				key: "action",
				width: "45%",
				dataIndex: "",
				render: (text, record, index) => (
					<>
						{record.status === "active" && (
							<Button
								type="danger"
								loading={record.key === symbolKey && loadingBlockedAsset}
								onClick={() => this.handleBlockAsset(record.symbol, record.key)}
								disabled={disableBtn && record.key === symbolKey}
							>
								Block asset
							</Button>
						)}

						<Button
							type="primary"
							onClick={this.showModalSetExchangeRates(modals.ADD_SET_EXCHANGE_RATES, record.symbol)}
						>
							Set exchange rates
						</Button>
					</>
				),
			},
		];

		return (
			<>
				<Card>
					<div style={{ marginBottom: 30 }}>
						<Button
							type="primary"
							style={style.button}
							onClick={this.showModalAddAsset(modals.ADD_ASSETS_MODAL)}
						>
							<Icon type="plus" /> Add new asset
						</Button>
						<Button type="primary" onClick={this.refreshTable}>
							<Icon type="reload" /> Refresh
						</Button>
					</div>

					<Table
						rowKey={data => data.key}
						columns={columns}
						dataSource={data}
						className="ovf-auto"
						pagination={pagination}
						loading={loadingAssetsList || loadingExchangeRates}
					/>
				</Card>

				<AddNewAsset
					isModalVisible={ADD_ASSETS_MODAL}
					hideModal={this.hideModalAddAsset(modals.ADD_ASSETS_MODAL)}
					getAssetsList={getAssetsList}
				/>

				<SetExchangeRates
					isModalVisible={ADD_SET_EXCHANGE_RATES}
					hideModal={this.hideModalSetExchangeRates(modals.ADD_SET_EXCHANGE_RATES)}
					tokenId={tokenId}
					buyPrice={buyPrice}
					sellPrice={sellPrice}
					getExchangeRates={getExchangeRates}
				/>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			data: state.assets.list.map((item, i) => ({ key: i, symbol: item })),
			exchangeRates: state.assets.rates,
			loadingAssetsList: state.assets.loadingAssetsList,
			loadingExchangeRates: state.assets.loadingExchangeRates,
		};
	},
	{
		getAssetsList: Actions.assets.getAssetsList,
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(AssetsList);
