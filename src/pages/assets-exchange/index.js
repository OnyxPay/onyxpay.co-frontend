import React, { Component } from "react";
import { connect } from "react-redux";
import {
	Row,
	Col,
	Card,
	Form,
	Icon,
	Input,
	Button,
	Select,
	Table,
	Divider,
	notification,
} from "antd";
import Actions from "../../redux/actions";
import { convertAmountToStr } from "../../utils/number";
import { PageTitle } from "../../components";
import { TimeoutError } from "promise-timeout";
import { SendRawTrxError } from "../../utils/custom-error";
import { exchangeAssets } from "../../api/exchange";
const { Option } = Select;

const assetsForBuyColumns = [
	{
		title: "Asset name",
		dataIndex: "name",
		key: "name",
	},
	{
		title: "Buy price",
		dataIndex: "buyPrice",
		key: "buyPrice",
	},
];

const assetsForSellColumns = [
	{
		title: "Asset name",
		dataIndex: "name",
		key: "name",
	},
	{
		title: "Sell price",
		dataIndex: "sellPrice",
		key: "sellPrice",
	},
	{
		title: "Balance",
		dataIndex: "balance",
		key: "balance",
	},
];

function countDecimals(value) {
	if (Math.floor(value) === value) return 0;
	if (value.toString().split(".").length !== 2) return 0;
	return value.toString().split(".")[1].length || 0;
}

function trimFloat(value, digits) {
	if (String(Number(value)) === String(value) && countDecimals(value) > digits)
		return Number(value).toFixed(digits);
	return value;
}

class AssetsExchange extends Component {
	state = {
		assetsForBuyData: [],
		assetsForSellData: [],
		assetToSell: {
			name: "",
			amount: "",
		},
		assetToBuy: {
			name: "",
			amount: "",
		},
		transactionInProcess: false,
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

		this.setAssetToSellValues(defaultAssetToSell.name, "");
		this.setAssetToBuyValues(defaultAssetToBuy.name, "");
	};

	async componentDidMount() {
		const { getExchangeRates } = this.props;
		await getExchangeRates();

		this.fillAssetsForBuyData();
		this.fillAssetsForSellData();
	}

	async componentDidUpdate(prevProps, prevState) {
		// should asset prices also update on change?
		if (JSON.stringify(prevProps.balance) !== JSON.stringify(this.props.balance)) {
			await this.fillAssetsForSellData();
			this.setDefaultAssets();
		}
	}

	setAssetToBuyValues = (assetName, amount) => {
		this.setState({ assetToBuy: { name: assetName, amount: trimFloat(amount, 9) } });
	};

	setAssetToSellValues = (assetName, amount) => {
		this.setState({ assetToSell: { name: assetName, amount: trimFloat(amount, 9) } });
	};

	recountAssetToSellAmount = (assetToSellName, assetToBuyName, amountToBuy) => {
		const { assetsForBuyData, assetsForSellData } = this.state;
		const { buyPrice } = assetsForBuyData.find(ratesRecord => ratesRecord.name === assetToBuyName);
		const amountToBuyInUsd = amountToBuy * buyPrice;
		const { sellPrice } = assetsForSellData.find(
			ratesRecord => ratesRecord.name === assetToSellName
		);
		const amountToSell = amountToBuyInUsd / sellPrice;
		return amountToSell;
	};

	recountAssetToBuyAmount = (assetToSellName, assetToBuyName, amountToSell) => {
		const { assetsForBuyData, assetsForSellData } = this.state;
		const { buyPrice } = assetsForBuyData.find(ratesRecord => ratesRecord.name === assetToBuyName);
		const amountToSellInUsd = amountToSell / buyPrice;
		const { sellPrice } = assetsForSellData.find(
			ratesRecord => ratesRecord.name === assetToSellName
		);
		const amountToBuy = amountToSellInUsd * sellPrice;
		return amountToBuy;
	};

	handleAssetToBuyAmountChange = event => {
		const { value } = event.target;
		const { assetToSell, assetToBuy } = this.state;

		this.setAssetToBuyValues(assetToBuy.name, value);
		this.setAssetToSellValues(
			assetToSell.name,
			this.recountAssetToSellAmount(assetToSell.name, assetToBuy.name, value)
		);
	};

	handleAssetToSellAmountChange = event => {
		const { value } = event.target;
		const { assetToSell, assetToBuy } = this.state;

		this.setAssetToSellValues(assetToSell.name, value);
		this.setAssetToBuyValues(
			assetToBuy.name,
			this.recountAssetToBuyAmount(assetToSell.name, assetToBuy.name, value)
		);
	};

	handleAssetToBuyChange = value => {
		const { assetToSell, assetToBuy } = this.state;

		this.setAssetToBuyValues(value, this.state.assetToBuy.amount);
		this.setAssetToSellValues(
			assetToSell.name,
			this.recountAssetToSellAmount(assetToSell.name, value, assetToBuy.amount)
		);
	};

	handleAssetToSellChange = value => {
		const { assetToSell, assetToBuy } = this.state;

		this.setAssetToSellValues(value, this.state.assetToSell.amount);
		this.setAssetToBuyValues(
			assetToBuy.name,
			this.recountAssetToBuyAmount(value, assetToBuy.name, assetToSell.amount)
		);
	};

	openNotification = (type, description) => {
		notification[type]({
			message: type === "success" ? "Exchange operation successful" : "Exchange operation failed",
			description: description,
			duration: 0,
		});
	};

	handleSubmit = async (e, operationType) => {
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
								<Form.Item>
									<Input
										prefix={<Icon type="logout" style={{ color: "rgba(0,0,0,.25)" }} />}
										type="number"
										step={10 ** -8}
										min={0}
										placeholder="You send"
										value={this.state.assetToSell.amount}
										onChange={this.handleAssetToSellAmountChange}
										disabled={this.state.transactionInProcess}
									/>
								</Form.Item>
								<Form.Item>
									<Select
										value={this.state.assetToSell.name}
										onChange={this.handleAssetToSellChange}
										disabled={this.state.transactionInProcess}
									>
										{this.state.assetsForSellData.map(asset => (
											<Option key={asset.key}>{asset.key}</Option>
										))}
									</Select>
								</Form.Item>
							</Col>

							<Col md={{ span: 24 }} lg={{ span: 10 }}>
								<Form.Item>
									<Input
										prefix={<Icon type="login" style={{ color: "rgba(0,0,0,.25)" }} />}
										type="number"
										step={10 ** -8}
										min={0}
										placeholder="You get"
										value={this.state.assetToBuy.amount}
										onChange={this.handleAssetToBuyAmountChange}
										disabled={this.state.transactionInProcess}
									/>
								</Form.Item>
								<Form.Item>
									<Select
										value={this.state.assetToBuy.name}
										onChange={this.handleAssetToBuyChange}
										disabled={this.state.transactionInProcess}
									>
										{this.state.assetsForBuyData.map(asset => (
											<Option key={asset.key}>{asset.key}</Option>
										))}
									</Select>
								</Form.Item>
							</Col>

							<Col md={{ span: 24 }} lg={{ span: 2 }}>
								<Form.Item>
									{this.state.transactionInProcess !== true ? (
										<Button type="primary" htmlType="submit">
											{" "}
											Exchange{" "}
										</Button>
									) : (
										<Icon type="loading" />
									)}
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
