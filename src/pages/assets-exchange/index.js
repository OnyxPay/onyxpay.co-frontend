import React, { Component } from "react";
import { connect } from "react-redux";
import {
	Row,
	Col,
	Card,
	Form,
	Input,
	InputNumber,
	Button,
	Select,
	Table,
	Divider,
	Tag,
} from "antd";
import ExchangeHistory from "components/paginated-list/ExchangeHistory";
import Actions from "../../redux/actions";
import { convertAmountToStr } from "../../utils/number";
import { PageTitle } from "../../components";
import { exchangeAssets, exchangeAssetsForOnyxCash } from "../../api/exchange";
import { isAssetBlocked } from "../../api/assets";
import { roles, onyxCashSymbol, OnyxCashDecimals } from "../../api/constants";
import { showNotification } from "components/notification";
import { handleBcError } from "api/network";
const { Option } = Select;

const assetsColumns = [
	{
		title: "Asset name",
		dataIndex: "name",
		key: "name",
		width: "9em",
	},
	{
		title: "Sell price",
		dataIndex: "sellPrice",
		key: "sellPrice",
		width: "9em",
	},
	{
		title: "Buy price",
		dataIndex: "buyPrice",
		key: "buyPrice",
		width: "9em",
	},
	{
		title: "Balance",
		dataIndex: "balance",
		key: "balance",
	},
];

class AssetsExchange extends Component {
	state = {
		assetsData: [],
		assetToSell: {
			name: "",
			amount: 0,
		},
		assetToBuy: {
			name: "",
			amount: 0,
		},
		assetToSellNameError: "",
		assetToBuyNameError: "",
		assetToSellAmountError: "",
		assetToBuyAmountError: "",
		formDataIsValid: true,
		transactionInProcess: false,
		dataLoaded: false,
		formTouched: false,
	};

	setStateAsync(state) {
		return new Promise(resolve => {
			this.setState(state, resolve);
		});
	}

	getAssetsForTypeData(type) {
		const { assetsData } = this.state;
		let res = [];

		for (let i in assetsData) {
			let item = assetsData[i];

			if (type === "buy" && item.buyPrice) {
				res.push(item);
			} else if (type === "sell" && item.sellPrice) {
				res.push(item);
			}
		}

		return res;
	}

	getAssetsForBuyData() {
		return this.getAssetsForTypeData("buy");
	}

	getAssetsForSellData() {
		const { user } = this.props;

		let assetsForSell = this.getAssetsForTypeData("sell");
		return user.role === roles.sa
			? assetsForSell.filter(asset => asset.name !== onyxCashSymbol)
			: assetsForSell;
	}

	fillAssetsData = async () => {
		const { exchangeRates, user } = this.props;
		const { assets, onyxCash } = this.props.balance;

		let assetsData = [];
		if (user.role === roles.a || user.role === roles.sa) {
			assetsData.push({
				key: onyxCashSymbol,
				name: onyxCashSymbol,
				buyPrice: 1,
				balance: convertAmountToStr(onyxCash, OnyxCashDecimals),
				sellPrice: 1,
			});
		}

		for (let record of exchangeRates) {
			let item = {
				key: record.symbol,
				name: record.symbol,
			};

			if (user.role !== roles.sa) {
				item.buyPrice = convertAmountToStr(record.buy, 8);
			}

			for (let sellRecord of assets) {
				if (sellRecord.symbol === record.symbol) {
					item.balance = convertAmountToStr(sellRecord.amount, 8);
					item.sellPrice = convertAmountToStr(record.sell, 8);
					break;
				}
			}

			assetsData.push(item);
		}

		await this.setStateAsync({
			assetsData,
		});
	};

	setDefaultAssets = () => {
		const { user } = this.props;

		let assetsForBuyData = this.getAssetsForBuyData();
		let assetsForSellData = this.getAssetsForSellData();

		let defaultAssetToSellName = "";
		let defaultAssetToBuyName = "";
		let selectedCorrectDefaultAssets = false;

		if (assetsForSellData.length !== 0 && assetsForBuyData.length >= 2) {
			const defaultAssetToSell = assetsForSellData[0];
			const defaultAssetToBuy = assetsForBuyData.find(
				record => record.name !== defaultAssetToSell.name
			);
			defaultAssetToSellName = defaultAssetToSell.name;
			defaultAssetToBuyName = defaultAssetToBuy.name;
			selectedCorrectDefaultAssets = true;
		} else if (user.role === roles.sa) {
			if (assetsForSellData.length >= 2) {
				const defaultAssetToBuy = assetsForBuyData[0];
				const defaultAssetToSell = assetsForSellData.find(
					record => record.name !== defaultAssetToBuy.name
				);
				defaultAssetToSellName = defaultAssetToSell.name;
				defaultAssetToBuyName = defaultAssetToBuy.name;
				selectedCorrectDefaultAssets = true;
			}
		}

		this.setAssetToSellValues(defaultAssetToSellName, 0);
		this.setAssetToBuyValues(defaultAssetToBuyName, 0);
		return selectedCorrectDefaultAssets;
	};

	async componentDidMount() {
		const { getExchangeRates } = this.props;
		await getExchangeRates();

		await this.fillAssetsData();

		let assetsForSellData = this.getAssetsForSellData();
		if (assetsForSellData.length !== 0) {
			if (this.setDefaultAssets()) {
				this.setState({ dataLoaded: true });
			}
		}
	}

	async componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevProps.balance) !== JSON.stringify(this.props.balance)) {
			const { dataLoaded } = this.state;

			await this.fillAssetsData();
			let assetsForSellData = this.getAssetsForSellData();
			if (!dataLoaded && assetsForSellData.length !== 0) {
				if (this.setDefaultAssets()) {
					this.setState({ dataLoaded: true });
				}
			}
		}
	}

	setAssetToBuyValues = async (assetName, amount) => {
		if (isNaN(amount)) amount = 0;
		await this.setStateAsync({ assetToBuy: { name: assetName, amount: amount } });
	};

	setAssetToSellValues = async (assetName, amount) => {
		if (isNaN(amount)) amount = 0;
		await this.setStateAsync({ assetToSell: { name: assetName, amount: amount } });
	};

	recountAssetToSellAmount = (assetToSellName, assetToBuyName, amountToBuy) => {
		let assetsForBuyData = this.getAssetsForBuyData();
		let assetsForSellData = this.getAssetsForSellData();

		const { buyPrice } = assetsForBuyData.find(ratesRecord => ratesRecord.name === assetToBuyName);
		const { sellPrice } = assetsForSellData.find(
			ratesRecord => ratesRecord.name === assetToSellName
		);
		const amountToSell = (amountToBuy * buyPrice) / sellPrice; // amountToBuyInUsd / sellPrice
		return amountToSell;
	};

	recountAssetToBuyAmount = (assetToSellName, assetToBuyName, amountToSell) => {
		let assetsForBuyData = this.getAssetsForBuyData();
		let assetsForSellData = this.getAssetsForSellData();

		const { buyPrice } = assetsForBuyData.find(ratesRecord => ratesRecord.name === assetToBuyName);
		const { sellPrice } = assetsForSellData.find(
			ratesRecord => ratesRecord.name === assetToSellName
		);
		const amountToBuy = (amountToSell * sellPrice) / buyPrice; // amountToSellInUsd * sellPrice
		return amountToBuy;
	};

	validateAssetName = async assetType => {
		const { assetToSell, assetToBuy } = this.state;

		let value = assetType === "sell" ? assetToSell.name : assetToBuy.name;
		let error = "";

		// TODO: optimize validation
		if (assetToSell.name === assetToBuy.name) {
			error = "Cannot exchange asset on itself";
		} else if (value !== onyxCashSymbol) {
			if (await isAssetBlocked(value)) {
				error = value + " asset is blocked at the moment";
			}
		}

		await this.setStateAsync({
			assetToSellNameError: assetType === "sell" ? error : this.state.assetToSellNameError,
			assetToBuyNameError: assetType === "buy" ? error : this.state.assetToBuyNameError,
		});
	};

	getUsdBasedRate = assetName => {
		const { exchangeRates } = this.props;

		if (assetName === "oUSD" || assetName === onyxCashSymbol) return 1;
		const asset = exchangeRates.find(ratesRecord => ratesRecord.symbol === assetName);
		const usdAsset = exchangeRates.find(ratesRecord => ratesRecord.symbol === "oUSD");
		return asset.sell / usdAsset.sell;
	};

	getUsdAmount = (assetName, amount) => {
		let usdBasedRate = this.getUsdBasedRate(assetName);
		return amount * usdBasedRate;
	};

	validateToSellAmount = async () => {
		const { assetToSell } = this.state;
		let assetsForSellData = this.getAssetsForSellData();
		let error = "";

		let asset = assetsForSellData.find(record => record.name === assetToSell.name);
		if (Number(assetToSell.amount) > Number(asset.balance)) {
			error = "Not enough " + asset.name + " to perform operation";
		}
		await this.setStateAsync({ assetToSellAmountError: error });
	};

	validateToBuyAmount = async () => {
		const { assetToBuy } = this.state;
		let error = "";

		const amountToBuyInUsd = this.getUsdAmount(assetToBuy.name, assetToBuy.amount);
		if (amountToBuyInUsd < 1) {
			error = "Amount to buy must be greater than 1 oUSD";
		}
		await this.setStateAsync({ assetToBuyAmountError: error });
	};

	validateForm = async () => {
		const { formTouched } = this.state;

		await this.validateAssetName("buy");
		await this.validateAssetName("sell");
		await this.validateToSellAmount();
		await this.validateToBuyAmount();

		if (!formTouched) this.setStateAsync({ formTouched: true });
		this.setStateAsync({ formDataIsValid: this.inputIsValid() });
	};

	inputIsValid = () => {
		const {
			assetToSellNameError,
			assetToBuyNameError,
			assetToSellAmountError,
			assetToBuyAmountError,
		} = this.state;
		return (
			assetToSellNameError.length === 0 &&
			assetToBuyNameError.length === 0 &&
			assetToSellAmountError.length === 0 &&
			assetToBuyAmountError.length === 0
		);
	};

	handleAssetToBuyAmountChange = async value => {
		const { assetToSell, assetToBuy } = this.state;

		await this.setAssetToBuyValues(assetToBuy.name, value);
		await this.setAssetToSellValues(
			assetToSell.name,
			this.recountAssetToSellAmount(assetToSell.name, assetToBuy.name, value)
		);
		this.validateForm();
	};

	handleAssetToSellAmountChange = async value => {
		const { assetToSell, assetToBuy } = this.state;

		await this.setAssetToSellValues(assetToSell.name, value);
		await this.setAssetToBuyValues(
			assetToBuy.name,
			this.recountAssetToBuyAmount(assetToSell.name, assetToBuy.name, value)
		);
		this.validateForm();
	};

	handleAssetToBuyChange = async value => {
		const { assetToSell, assetToBuy } = this.state;

		await this.setAssetToBuyValues(value, this.state.assetToBuy.amount);
		await this.setAssetToSellValues(
			assetToSell.name,
			this.recountAssetToSellAmount(assetToSell.name, value, assetToBuy.amount)
		);
		this.validateForm();
	};

	handleAssetToSellChange = async value => {
		const { assetToSell, assetToBuy } = this.state;

		await this.setAssetToSellValues(value, this.state.assetToSell.amount);
		await this.setAssetToBuyValues(
			assetToBuy.name,
			this.recountAssetToBuyAmount(value, assetToBuy.name, assetToSell.amount)
		);
		this.validateForm();
	};

	openNotification = (type, description) => {
		showNotification({
			type: type,
			msg: type === "success" ? "Exchange operation successful" : "Exchange operation failed",
		});
	};

	handleSubmit = async e => {
		e.preventDefault();
		e.stopPropagation();

		await this.setStateAsync({ transactionInProcess: true });

		const { assetToBuy, assetToSell } = this.state;
		console.log("asset to buy", assetToBuy);
		console.log("asset to sell", assetToSell);
		try {
			let result = {};
			if (assetToSell.name === onyxCashSymbol) {
				result = await exchangeAssetsForOnyxCash({
					tokenId: assetToBuy.name,
					amount: assetToBuy.amount.toFixed(8),
					operationType: "buy",
				});
			} else if (assetToBuy.name === onyxCashSymbol) {
				result = await exchangeAssetsForOnyxCash({
					tokenId: assetToSell.name,
					amount: assetToSell.amount.toFixed(8),
					operationType: "sell",
				});
			} else {
				result = await exchangeAssets({
					assetToSellName: assetToSell.name,
					assetToBuyName: assetToBuy.name,
					amountToBuy: assetToBuy.amount.toFixed(8),
				});
			}
			this.openNotification(result.Error === 0 ? "success" : "error");
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({ transactionInProcess: false });
		}
	};

	render() {
		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>
				<Card className="exchange-card-wrapper">
					<Row gutter={16}>
						<Form
							layout="inline"
							onSubmit={e => {
								this.handleSubmit(e);
							}}
							className="exchange-form"
						>
							<Col lg={{ span: 24 }} xl={{ span: 24 }}>
								<Col span={24}>Asset to sell:</Col>
								<Col span={24}>
									<Col xs={{ span: 24 }} sm={{ span: 16 }} lg={{ span: 10 }} xl={{ span: 7 }}>
										<Form.Item
											style={{ display: "flex" }}
											className="asset-exchange-form-input-parent"
											validateStatus={
												this.state.assetToSellAmountError.length === 0 ? "success" : "error"
											}
										>
											<Input.Group
												compact
												style={{ display: "flex" }}
												className="asset-exchange-amount-input-group"
											>
												<InputNumber
													min={0}
													precision={8}
													placeholder="You send"
													value={this.state.assetToSell.amount}
													onChange={this.handleAssetToSellAmountChange}
													disabled={this.state.transactionInProcess || !this.state.dataLoaded}
													style={{ width: "100%" }}
													className="asset-exchange-amount-input-group-input-number"
												/>
												<Button
													onClick={() => {
														const { assetToSell } = this.state;
														let assetsForSellData = this.getAssetsForSellData();

														let asset = assetsForSellData.find(
															record => record.name === assetToSell.name
														);
														this.handleAssetToSellAmountChange(Number(asset.balance));
													}}
													className="asset-exchange-amount-input-group-button"
													disabled={this.state.transactionInProcess || !this.state.dataLoaded}
												>
													Max
												</Button>
											</Input.Group>
										</Form.Item>
									</Col>
									<Col xs={{ span: 24 }} sm={{ span: 6 }} lg={{ span: 6 }} xl={{ span: 5 }}>
										<Form.Item
											validateStatus={
												this.state.assetToSellNameError.length === 0 ? "success" : "error"
											}
											style={{ display: "flex" }}
											className="asset-exchange-form-select-parent"
										>
											<Select
												value={this.state.assetToSell.name}
												onChange={this.handleAssetToSellChange}
												disabled={this.state.transactionInProcess || !this.state.dataLoaded}
												className="asset-exchange-select"
											>
												{this.getAssetsForSellData().map(asset => (
													<Option key={asset.key}>{asset.key}</Option>
												))}
											</Select>
										</Form.Item>
									</Col>
								</Col>
								<Col span={24}>
									{this.state.assetToSellNameError.length !== 0 ? (
										<Tag color="red">{this.state.assetToSellNameError}</Tag>
									) : (
										""
									)}
									{this.state.assetToSellAmountError.length !== 0 ? (
										<Tag color="red"> {this.state.assetToSellAmountError}</Tag>
									) : (
										""
									)}
								</Col>
							</Col>

							<Col
								xs={{ span: 24 }}
								sm={{ span: 24 }}
								md={{ span: 24 }}
								lg={{ span: 24 }}
								xl={{ span: 24 }}
							>
								<div className="form-divider" />
							</Col>

							<Col lg={{ span: 24 }} xl={{ span: 24 }}>
								<Col span={24}>Asset to buy:</Col>
								<Col span={24}>
									<Col xs={{ span: 24 }} sm={{ span: 16 }} lg={{ span: 10 }} xl={{ span: 7 }}>
										<Form.Item
											style={{ display: "flex" }}
											className="asset-exchange-form-input-parent"
											validateStatus={
												this.state.assetToBuyAmountError.length === 0 ? "success" : "error"
											}
										>
											<Input.Group
												compact
												style={{ display: "flex" }}
												className="asset-exchange-amount-input-group"
											>
												<InputNumber
													min={0}
													precision={8}
													placeholder="You get"
													value={this.state.assetToBuy.amount}
													onChange={this.handleAssetToBuyAmountChange}
													disabled={this.state.transactionInProcess || !this.state.dataLoaded}
													style={{ width: "100%" }}
													className="asset-exchange-amount-input-group-input-number"
												/>
												<Button
													onClick={() => {
														const { assetToSell, assetToBuy } = this.state;
														let assetsForSellData = this.getAssetsForSellData();

														let asset = assetsForSellData.find(
															record => record.name === assetToSell.name
														);
														this.handleAssetToBuyAmountChange(
															this.recountAssetToBuyAmount(
																assetToSell.name,
																assetToBuy.name,
																asset.balance
															)
														);
													}}
													className="asset-exchange-amount-input-group-button"
													disabled={this.state.transactionInProcess || !this.state.dataLoaded}
												>
													Max
												</Button>
											</Input.Group>
										</Form.Item>
									</Col>

									<Col xs={{ span: 24 }} sm={{ span: 6 }} lg={{ span: 6 }} xl={{ span: 5 }}>
										<Form.Item
											validateStatus={
												this.state.assetToBuyNameError.length === 0 ? "success" : "error"
											}
											style={{ display: "flex" }}
											className="asset-exchange-form-select-parent"
										>
											<Select
												value={this.state.assetToBuy.name}
												onChange={this.handleAssetToBuyChange}
												disabled={this.state.transactionInProcess || !this.state.dataLoaded}
												className="asset-exchange-select"
											>
												{this.getAssetsForBuyData().map(asset => (
													<Option key={asset.key}>{asset.key}</Option>
												))}
											</Select>
										</Form.Item>
									</Col>
								</Col>
								<Col span={24}>
									{this.state.assetToBuyNameError.length !== 0 ? (
										<Tag color="red"> {this.state.assetToBuyNameError} </Tag>
									) : (
										""
									)}
									{this.state.assetToBuyAmountError.length !== 0 ? (
										<Tag color="red"> {this.state.assetToBuyAmountError} </Tag>
									) : (
										""
									)}
								</Col>
							</Col>

							<Col
								xs={{ span: 24 }}
								sm={{ span: 24 }}
								md={{ span: 24 }}
								lg={{ span: 24 }}
								xl={{ span: 2 }}
							>
								<Form.Item>
									<Button
										type="primary"
										htmlType="submit"
										disabled={
											!this.state.dataLoaded ||
											!this.state.formDataIsValid ||
											!this.state.formTouched
										}
										loading={this.state.transactionInProcess}
										className="exchange-submit-button"
									>
										Exchange
									</Button>
								</Form.Item>
							</Col>
						</Form>
					</Row>
					<Divider />
					<Row gutter={48} className="exchange-tables">
						<Col lg={24} xl={12}>
							<Table
								columns={assetsColumns}
								dataSource={this.state.assetsData}
								pagination={false}
								scroll={{ y: "16em" }}
								locale={{ emptyText: "No assets available in the system at the moment." }}
							/>
						</Col>
					</Row>
				</Card>

				<ExchangeHistory />
			</>
		);
	}
}

export default connect(
	state => {
		return {
			balance: state.balance,
			exchangeRates: state.assets.rates,
			user: state.user,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(AssetsExchange);
