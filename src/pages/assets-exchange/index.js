import React, { Component } from "react";
import { connect } from "react-redux";
import {
	Row,
	Col,
	Card,
	Form,
	Icon,
	InputNumber,
	Button,
	Select,
	Table,
	Divider,
	notification,
	Tag,
} from "antd";
import Actions from "../../redux/actions";
import { convertAmountToStr } from "../../utils/number";
import { PageTitle } from "../../components";
import { TimeoutError } from "promise-timeout";
import { SendRawTrxError } from "../../utils/custom-error";
import { exchangeAssets } from "../../api/exchange";
import { isAssetBlocked } from "../../api/assets";
const { Option } = Select;

const assetsForBuyColumns = [
	{
		title: "Asset name",
		dataIndex: "name",
		key: "name",
		width: 80,
	},
	{
		title: "Buy price",
		dataIndex: "buyPrice",
		key: "buyPrice",
		width: 80,
	},
];

const assetsForSellColumns = [
	{
		title: "Asset name",
		dataIndex: "name",
		key: "name",
		width: 80,
	},
	{
		title: "Sell price",
		dataIndex: "sellPrice",
		key: "sellPrice",
		width: 80,
	},
	{
		title: "Balance",
		dataIndex: "balance",
		key: "balance",
		width: 80,
	},
];

class AssetsExchange extends Component {
	state = {
		assetsForBuyData: [],
		assetsForSellData: [],
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
	};

	fillAssetsForBuyData = async () => {
		const { exchangeRates } = this.props;

		let assetsForBuyData = [];
		for (let record of exchangeRates) {
			assetsForBuyData.push({
				key: record.symbol,
				name: record.symbol,
				buyPrice: convertAmountToStr(record.buy, 8),
			});
		}
		await this.setState({
			assetsForBuyData: assetsForBuyData,
		});
	};

	fillAssetsForSellData = async () => {
		const { assets } = this.props.balance;
		const { exchangeRates } = this.props;

		// get all assets, in which user's balance is greater than 0
		let assetsForSellData = [];
		for (let record of assets) {
			let assetRatesData = exchangeRates.find(ratesRecord => ratesRecord.symbol === record.symbol);
			assetsForSellData.push({
				key: record.key,
				name: record.key,
				balance: convertAmountToStr(record.amount, 8),
				sellPrice: convertAmountToStr(assetRatesData.sell, 8),
			});
		}

		await this.setState({
			assetsForSellData: assetsForSellData,
		});
	};

	setDefaultAssets = () => {
		const { assetsForBuyData, assetsForSellData } = this.state;

		const defaultAssetToSell = assetsForSellData[0];
		const defaultAssetToBuy = assetsForBuyData.find(
			record => record.name !== defaultAssetToSell.name
		);

		this.setAssetToSellValues(defaultAssetToSell.name, 0);
		this.setAssetToBuyValues(defaultAssetToBuy.name, 0);
	};

	async componentDidMount() {
		const { getExchangeRates } = this.props;
		await getExchangeRates();

		await this.fillAssetsForBuyData();
		await this.fillAssetsForSellData();

		const { assetsForSellData } = this.state;
		if (assetsForSellData.length !== 0) {
			await this.setDefaultAssets();
			this.setState({ dataLoaded: true });
		}
	}

	async componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevProps.balance) !== JSON.stringify(this.props.balance)) {
			await this.fillAssetsForSellData();
			await this.setDefaultAssets();
			this.setState({ dataLoaded: true });
		}
	}

	setAssetToBuyValues = (assetName, amount) => {
		this.setState({ assetToBuy: { name: assetName, amount: amount } });
	};

	setAssetToSellValues = (assetName, amount) => {
		this.setState({ assetToSell: { name: assetName, amount: amount } });
	};

	recountAssetToSellAmount = (assetToSellName, assetToBuyName, amountToBuy) => {
		const { assetsForBuyData, assetsForSellData } = this.state;
		const { buyPrice } = assetsForBuyData.find(ratesRecord => ratesRecord.name === assetToBuyName);
		const { sellPrice } = assetsForSellData.find(
			ratesRecord => ratesRecord.name === assetToSellName
		);
		const amountToSell = (amountToBuy * buyPrice) / sellPrice; // amountToBuyInUsd / sellPrice
		return amountToSell;
	};

	recountAssetToBuyAmount = (assetToSellName, assetToBuyName, amountToSell) => {
		const { assetsForBuyData, assetsForSellData } = this.state;
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
		if (assetToSell.name === assetToBuy.name) {
			error = "Cannot exchange asset on itself";
		} else if (await isAssetBlocked(value)) {
			error = value + " asset is blocked at the moment";
		}

		await this.setState({
			assetToSellNameError: assetType === "sell" ? error : this.state.assetToSellNameError,
			assetToBuyNameError: assetType === "buy" ? error : this.state.assetToBuyNameError,
		});
	};

	validateToSellAmount = async () => {
		const { assetToSell, assetsForSellData } = this.state;
		let error = "";

		let asset = assetsForSellData.find(record => record.name === assetToSell.name);
		const { sellPrice } = assetsForSellData.find(
			ratesRecord => ratesRecord.name === assetToSell.name
		);
		const amountToSellInUsd = assetToSell.amount * sellPrice;

		if (Number(amountToSellInUsd) < 1) {
			error = "Amount to sell must be greater than 1 oUSD";
		} else if (Number(assetToSell.amount) > Number(asset.balance)) {
			error = "Not enough " + asset.name + " to perform operation";
		}
		await this.setState({ assetToSellAmountError: error });
	};

	validateForm = async () => {
		await this.validateAssetName("buy");
		await this.validateAssetName("sell");
		await this.validateToSellAmount();

		this.setState({ formDataIsValid: this.inputIsValid() });
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
		notification[type]({
			message: type === "success" ? "Exchange operation successful" : "Exchange operation failed",
			description: description,
			duration: 0,
		});
	};

	handleSubmit = async e => {
		e.preventDefault();
		e.stopPropagation();

		await this.setState({ transactionInProcess: true });

		const { assetToBuy, assetToSell } = this.state;
		const { wallet } = this.props;
		console.log("asset to buy", assetToBuy);
		console.log("asset to sell", assetToSell);
		try {
			let result = await exchangeAssets({
				assetToSellName: assetToSell.name,
				assetToBuyName: assetToBuy.name,
				amountToBuy: assetToBuy.amount,
				wallet: wallet,
			});
			this.openNotification(result.Error === 0 ? "success" : "error");
			this.setState({ transactionInProcess: false });
			console.log(result);
		} catch (e) {
			if (e instanceof TimeoutError) {
				this.openNotification(
					"error",
					"Transaction timed out. Try checking your balance some time later."
				);
			} else if (e instanceof SendRawTrxError) {
				this.openNotification("error", "Contract execution error");
			} else {
				this.openNotification("error", "Unknown error");
			}
			console.log("error: ", e);
			this.setState({ transactionInProcess: false });
		}
	};

	render() {
		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>
				<Card>
					<Row gutter={16}>
						<Form
							layout="inline"
							onSubmit={e => {
								this.handleSubmit(e);
							}}
						>
							<Col md={{ span: 24 }} lg={{ span: 10 }}>
								<Col lg={{ span: 24 }}>Asset to sell:</Col>
								<Col lg={{ span: 24 }}>
									<Form.Item
										validateStatus={
											this.state.assetToSellAmountError.length === 0 ? "success" : "error"
										}
									>
										<InputNumber
											prefix={<Icon type="logout" style={{ color: "rgba(0,0,0,.25)" }} />}
											min={0}
											precision={8}
											placeholder="You send"
											value={this.state.assetToSell.amount}
											onChange={this.handleAssetToSellAmountChange}
											disabled={this.state.transactionInProcess || !this.state.dataLoaded}
											style={{ width: "100%" }}
										/>
									</Form.Item>
									<Form.Item
										validateStatus={
											this.state.assetToSellNameError.length === 0 ? "success" : "error"
										}
									>
										<Select
											value={this.state.assetToSell.name}
											onChange={this.handleAssetToSellChange}
											disabled={this.state.transactionInProcess || !this.state.dataLoaded}
										>
											{this.state.assetsForSellData.map(asset => (
												<Option key={asset.key}>{asset.key}</Option>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col lg={{ span: 24 }}>
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

							<Col md={{ span: 24 }} lg={{ span: 10 }}>
								<Col lg={{ span: 24 }}>Asset to buy:</Col>
								<Col lg={{ span: 24 }}>
									<Form.Item
										validateStatus={
											this.state.assetToBuyAmountError.length === 0 ? "success" : "error"
										}
									>
										<InputNumber
											prefix={<Icon type="login" style={{ color: "rgba(0,0,0,.25)" }} />}
											min={0}
											precision={8}
											placeholder="You get"
											value={this.state.assetToBuy.amount}
											onChange={this.handleAssetToBuyAmountChange}
											disabled={this.state.transactionInProcess || !this.state.dataLoaded}
											style={{ width: "100%" }}
										/>
									</Form.Item>
									<Form.Item
										validateStatus={
											this.state.assetToBuyNameError.length === 0 ? "success" : "error"
										}
									>
										<Select
											value={this.state.assetToBuy.name}
											onChange={this.handleAssetToBuyChange}
											disabled={this.state.transactionInProcess || !this.state.dataLoaded}
										>
											{this.state.assetsForBuyData.map(asset => (
												<Option key={asset.key}>{asset.key}</Option>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col lg={{ span: 24 }}>
									{this.state.assetToBuyNameError.length !== 0 ? (
										<Tag color="red"> {this.state.assetToBuyNameError} </Tag>
									) : (
										""
									)}
								</Col>
							</Col>

							<Col md={{ span: 24 }} lg={{ span: 2 }}>
								<Form.Item>
									<Button
										type="primary"
										htmlType="submit"
										disabled={!this.state.dataLoaded || !this.state.formDataIsValid}
										loading={this.state.transactionInProcess}
									>
										Exchange
									</Button>
								</Form.Item>
							</Col>
						</Form>
					</Row>
					<Divider />
					<Row gutter={48}>
						<Col md={24} lg={11}>
							<Table
								columns={assetsForSellColumns}
								dataSource={this.state.assetsForSellData}
								pagination={false}
								scroll={{ y: 240 }}
							/>
						</Col>
						<Col md={24} lg={11}>
							<Table
								columns={assetsForBuyColumns}
								dataSource={this.state.assetsForBuyData}
								pagination={false}
								scroll={{ y: 240 }}
							/>
						</Col>
					</Row>
				</Card>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			wallet: state.wallet,
			balance: state.balance,
			exchangeRates: state.assets.rates,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(AssetsExchange);
