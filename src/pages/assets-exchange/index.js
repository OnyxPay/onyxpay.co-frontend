import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Card, Form, Icon, Input, Button, Select, Table, Divider } from "antd";
import Actions from "../../redux/actions";
import { convertAmountToStr } from "../../utils/number";
import { PageTitle } from "../../components";
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
		this.setState({
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
		this.setState({
			assetsForSellData: assetsForSellData,
		});
	};

	async componentDidMount() {
		const { getExchangeRates } = this.props;
		await getExchangeRates();

		this.fillAssetsForBuyData();
		this.fillAssetsForSellData();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.balance !== this.props.balance) {
			this.fillAssetsForSellData();
		}
	}

	handleAssetToBuyAmountChange = async event => {
		console.log(event.target.value);
		this.setState({ assetToBuy: { name: this.state.assetToBuy.name, amount: event.target.value } });
		// recount assetToSell amount
	};

	handleAssetToSellAmountChange = async event => {
		this.setState({
			assetToSell: { name: this.state.assetToSell.name, amount: event.target.value },
		});
		// recount assetToBuy amount
	};

	render() {
		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>
				<Card>
					<Row gutter={16}>
						<Form layout="inline" onSubmit={this.handleSubmit}>
							<Col md={{ span: 24 }} lg={{ span: 10 }}>
								<Form.Item>
									<Input
										prefix={<Icon type="logout" style={{ color: "rgba(0,0,0,.25)" }} />}
										type="number"
										step={0.1}
										min={0}
										placeholder="You send"
										value={this.state.assetToBuy.amount}
										onInput={this.handleAssetToBuyAmountChange}
									/>
								</Form.Item>
								<Form.Item>
									<Select defaultValue="oUSD">
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
										step={0.1}
										min={0}
										placeholder="You get"
										value={this.state.assetToSell.amount}
										onChange={this.handleAssetToSellAmountChange}
									/>
								</Form.Item>
								<Form.Item>
									<Select defaultValue="oUSD">
										{this.state.assetsForBuyData.map(asset => (
											<Option key={asset.key}>{asset.key}</Option>
										))}
									</Select>
								</Form.Item>
							</Col>

							<Col md={{ span: 24 }} lg={{ span: 2 }}>
								<Form.Item>
									<Button type="primary" htmlType="submit">
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
			// wallet: state.wallet,
			balance: state.balance,
			exchangeRates: state.assets.rates,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(AssetsExchange);
