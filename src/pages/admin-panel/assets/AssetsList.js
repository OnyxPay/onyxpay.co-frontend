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
import styled from "styled-components";

const modals = {
	ADD_ASSETS_MODAL: "ADD_ASSETS_MODAL",
	ADD_SET_EXCHANGE_RATES: "ADD_SET_EXCHANGE_RATES",
};

const ButtonContainer = styled.div`
	margin-bottom: 30px;
	button:first-child {
		margin-right: 10px;
	}
	@media (max-width: 620px) {
		button:first-child {
			margin-bottom: 10px;
		}
	}
`;

function sortValues(valA, valB) {
	if (valA < valB) {
		return -1;
	}
	if (valA > valB) {
		return 1;
	}
	return 0;
}

class AssetsList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchText: "",
			loadingBlockedAsset: false,
			ADD_ASSETS_MODAL: false,
			ADD_SET_EXCHANGE_RATES: false,
			symbolKey: null,
			tokenId: null,
			assetsData: null,
			disableBtn: false,
			loadingTableData: false,
			pagination: { current: 1, pageSize: 20 },
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
		await this.fetchAssets();
	}

	showModalAddAsset = type => () => {
		this.setState({ ADD_ASSETS_MODAL: true });
	};

	hideModalAddAsset = type => () => {
		this.setState({ ADD_ASSETS_MODAL: false });
	};

	showModalSetExchangeRates = (symbol, buyPrice, sellPrice) => () => {
		this.setState({
			tokenId: symbol,
			buyPrice,
			sellPrice,
			ADD_SET_EXCHANGE_RATES: true,
			disableBtn: false,
		});
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

	checkAssetStatus = status => {
		if (status === 1) {
			return "active";
		} else if (status === 2) {
			return "blocked";
		} else {
			return "n/a";
		}
	};

	refreshTable = async () => {
		await this.fetchAssets();
		this.setState({
			disableBtn: false,
		});
	};

	handleTableChange = (pagination, filters) => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				for (const filter in filters) {
					filters[filter] = filters[filter][0];
				}
				this.fetchAssets(filters);
			}
		);
	};

	async fetchAssets(opts = {}) {
		try {
			this.setState({ loadingTableData: true });
			const { pagination } = this.state;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const assetsData = await getAssetsData(params);
			pagination.total = assetsData.total;
			this.setState({ assetsData: assetsData.items, pagination, loadingTableData: false });
		} catch (e) {}
	}

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
			assetsData,
			loadingTableData,
		} = this.state;
		const { getAssetsList } = this.props;
		if (assetsData === null) {
			return null;
		}
		const columns = [
			{
				title: "Assets name",
				key: "name",
				width: "15%",
				dataIndex: "name",
				sorter: (a, b) => {
					const nameA = a.name.toLowerCase();
					const nameB = b.name.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["ascend", "descend"],
				...getColumnSearchProps()("name"),
				...getOnColumnFilterProp("name"),
			},
			{
				title: "Buy price",
				key: "buyPrice",
				width: "20%",
				render: record => (!record.buyPrice ? "n/a" : convertAmountToStr(record.buyPrice, 8)),
			},
			{
				title: "Sell price",
				key: "sellPrice",
				width: "20%",
				render: record => (!record.sellPrice ? "n/a" : convertAmountToStr(record.sellPrice, 8)),
			},
			{
				title: "Status",
				dataIndex: "status",
				key: "status",
				width: "20%",
				render: (text, record, index) => this.checkAssetStatus(record.status),
			},
			{
				title: "Action",
				key: "action",
				width: "45%",
				dataIndex: "",
				render: (text, record, index) => (
					<>
						{record.status === 1 && (
							<Button
								type="danger"
								loading={record.id === symbolKey && loadingBlockedAsset}
								onClick={() => this.handleBlockAsset(record.name, record.id)}
								disabled={disableBtn && record.id === symbolKey}
							>
								Block asset
							</Button>
						)}

						<Button
							type="primary"
							onClick={this.showModalSetExchangeRates(
								record.name,
								record.buyPrice,
								record.sellPrice,
								modals.ADD_SET_EXCHANGE_RATES
							)}
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
					<ButtonContainer>
						<Button type="primary" onClick={this.showModalAddAsset(modals.ADD_ASSETS_MODAL)}>
							<Icon type="plus" /> Add new asset
						</Button>
						<Button type="primary" onClick={this.refreshTable}>
							<Icon type="reload" /> Refresh
						</Button>
					</ButtonContainer>

					<Table
						rowKey={assetsData => assetsData.id}
						columns={columns}
						dataSource={assetsData}
						className="ovf-auto"
						onChange={this.handleTableChange}
						pagination={{ ...pagination }}
						loading={loadingTableData}
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
