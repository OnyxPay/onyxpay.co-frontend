import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Table, Icon, Input } from "antd";
import Actions from "redux/actions";
import { blockAsset } from "api/admin/assets";
import { isAssetBlocked } from "api/assets";
import AddNewAsset from "components/modals/admin/AddNewAsset";
import SetExchangeRates from "components/modals/admin/SetExchangeRates";
import { TimeoutError } from "promise-timeout";
import { showNotification, showTimeoutNotification } from "components/notification";
import { convertAmountToStr } from "utils/number";

const modals = {
	ADD_ASSETS_MODAL: "ADD_ASSETS_MODAL",
	ADD_SET_EXCHANGE_RATES: "ADD_SET_EXCHANGE_RATES",
};

const style = {
	button: {
		marginRight: 8,
		marginBottom: 5,
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
			loadingIsBlockedAsset: false,
			ADD_ASSETS_MODAL: false,
			ADD_SET_EXCHANGE_RATES: false,
			data: null,
			pagination: { pageSize: 20 },
			symbolKey: null,
			tokenId: null,
		};
	}

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={node => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{ width: 90, marginRight: 8 }}
				>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => (
			<Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
		),
		onFilter: (value, record) =>
			record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
	});

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
	}

	showModalAddAsset = type => () => {
		this.setState({ ADD_ASSETS_MODAL: true });
	};

	hideModalAddAsset = type => () => {
		this.setState({ ADD_ASSETS_MODAL: false });
	};

	showModalSetExchangeRates = (type, symbol) => () => {
		this.setState({ tokenId: symbol, ADD_SET_EXCHANGE_RATES: true });
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
			}
		} catch (e) {
			if (e instanceof TimeoutError) {
				showTimeoutNotification();
			} else {
				showNotification({
					type: "error",
					msg: e.message,
				});
			}
		} finally {
			this.setState({
				loadingBlockedAsset: false,
			});
		}
	};

	handleCheckAssetBlocked = async (asset_symbol, key) => {
		this.setState({
			symbolKey: key,
			loadingIsBlockedAsset: true,
		});
		const res = await isAssetBlocked(asset_symbol);
		this.setState({
			loadingIsBlockedAsset: false,
		});
		if (res) {
			showNotification({
				type: "success",
				msg: "Asset is blocked",
			});
		} else {
			showNotification({
				type: "success",
				msg: "Asset isn't blocked",
			});
		}
	};

	render() {
		const {
			loadingIsBlockedAsset,
			pagination,
			loadingBlockedAsset,
			symbolKey,
			ADD_ASSETS_MODAL,
			ADD_SET_EXCHANGE_RATES,
			tokenId,
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
				title: "Asset name",
				key: "symbol",
				width: "40%",
				dataIndex: "symbol",
				sorter: (a, b) => {
					const nameA = a.symbol.toLowerCase();
					const nameB = b.symbol.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["ascend", "descend"],
				...this.getColumnSearchProps("symbol"),
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
				title: "Action",
				key: "action",
				width: "20%",
				dataIndex: "",
				render: res => (
					<>
						<Button
							type="danger"
							loading={res.key === symbolKey && loadingBlockedAsset}
							onClick={() => this.handleBlockAsset(res.symbol, res.key)}
							style={style.button}
						>
							Block asset
						</Button>
						<Button
							type="primary"
							onClick={this.showModalSetExchangeRates(modals.ADD_SET_EXCHANGE_RATES, res.symbol)}
							style={style.button}
						>
							Set exchange rates
						</Button>
						<Button
							loading={res.key === symbolKey && loadingIsBlockedAsset}
							onClick={() => this.handleCheckAssetBlocked(res.symbol, res.key)}
							style={style.button}
						>
							Is blocked asset
						</Button>
					</>
				),
			},
		];

		return (
			<>
				<Card>
					<div style={{ marginBottom: 30 }}>
						<Button type="primary" onClick={this.showModalAddAsset(modals.ADD_ASSETS_MODAL)}>
							<Icon type="plus" /> Add new asset
						</Button>
					</div>

					<Table
						rowKey={data => data.key}
						columns={columns}
						dataSource={data}
						style={{ overflowX: "auto" }}
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
