import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Table, Card, Form, Divider, InputNumber, Button } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { convertAmountToStr } from "../../utils/number";
import { getWallet, getAccount } from "../../api/wallet";

const columns = [
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
	{
		title: "Sell price",
		dataIndex: "sellPrice",
		key: "sellPrice",
	},
];

class AssetsExchange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedAsset: {
				name: "",
				price: 0,
			},
		};
	}

	async componentDidMount() {
		this.onActiveAssedChanged = this.onActiveAssedChanged.bind(this);
		this.handleBuyAmountChange = this.handleBuyAmountChange.bind(this);
		this.handleSellAmountChange = this.handleSellAmountChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		const { getExchangeRates } = this.props;
		await getExchangeRates();
		const { exchangeRates } = this.props;
		let data = [];
		for (let record of exchangeRates) {
			if (record.symbol !== "oUSD") {
				data.push({
					key: record.symbol,
					name: record.symbol,
					buyPrice: convertAmountToStr(record.buy, 8),
					sellPrice: convertAmountToStr(record.sell, 8),
				});
			}
		}
		this.setState({ assetData: data });

		this.setState({
			selectedAsset: {
				name: data[0].key,
				buyPrice: data[0].buyPrice,
				sellPrice: data[0].sellPrice,
			},
			buyAmount: 0,
			sellAmount: 0,
		});
	}

	onActiveAssedChanged(record) {
		this.setState({
			selectedAsset: {
				name: record.key,
				buyPrice: record.buyPrice,
				sellPrice: record.sellPrice,
			},
		});
	}

	async handleBuyAmountChange(value) {
		await this.setState({ buyAmount: value });
	}

	async handleSellAmountChange(value) {
		await this.setState({ sellAmount: value });
	}

	async handleSubmit(e, operationType) {
		e.preventDefault();
		e.stopPropagation();

		const walletDecoded = getWallet(this.props.wallet);
		const account = getAccount(walletDecoded);

		try {
			let result = await this.props.exchangeAssets({
				operationType: operationType,
				assetName: this.state.selectedAsset.name,
				amountToBuy:
					operationType === "buy"
						? this.state.buyAmount
						: this.state.sellAmount * this.state.selectedAsset.sellPrice,
				acct: account.address.toHexString(),
				base58Address: account.address,
				privkey: account.encryptedKey,
			});

			console.log(result);
		} catch (e) {
			console.log("error: ", e);
		}
	}

	render() {
		const formItemLayout = {
			labelCol: { span: 8 },
			wrapperCol: { span: 14 },
		};

		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>
				<Row gutter={16}>
					<Col md={24} lg={12}>
						<Table
							onRowClick={this.onActiveAssedChanged}
							columns={columns}
							dataSource={this.state.assetData}
						/>
					</Col>
					<Col md={24} lg={12}>
						<Card>
							<Row gutter={16}>
								<Col md={24} lg={12}>
									<Form
										{...formItemLayout}
										onSubmit={e => {
											this.handleSubmit(e, "buy");
										}}
									>
										<Divider> {"Buy " + this.state.selectedAsset.name} </Divider>
										<Form.Item label="Price: ">
											<span className="ant-form-text"> {this.state.selectedAsset.buyPrice} </span>
										</Form.Item>

										<Form.Item label="Amount: ">
											<InputNumber min={0} defaultValue={0} onChange={this.handleBuyAmountChange} />
										</Form.Item>

										<Form.Item label="Total: ">
											<span className="ant-form-text">
												{this.state.selectedAsset.buyPrice * this.state.buyAmount || 0}
											</span>
											<span className="ant-form-text">oUSD</span>
										</Form.Item>

										<Form.Item wrapperCol={{ span: 12, offset: 10 }}>
											<Button type="primary" htmlType="submit">
												Buy
											</Button>
										</Form.Item>
									</Form>
								</Col>
								<Col md={24} lg={12}>
									<Divider> {"Sell " + this.state.selectedAsset.name} </Divider>
									<Form
										{...formItemLayout}
										onSubmit={e => {
											this.handleSubmit(e, "sell");
										}}
									>
										<Form.Item label="Price: ">
											<span className="ant-form-text"> {this.state.selectedAsset.sellPrice} </span>
										</Form.Item>

										<Form.Item label="Amount: ">
											<InputNumber
												min={0}
												defaultValue={0}
												onChange={this.handleSellAmountChange}
											/>
										</Form.Item>

										<Form.Item label="Total: ">
											<span className="ant-form-text">
												{this.state.selectedAsset.sellPrice * this.state.sellAmount || 0}
											</span>
											<span className="ant-form-text">oUSD</span>
										</Form.Item>

										<Form.Item wrapperCol={{ span: 12, offset: 10 }}>
											<Button type="primary" htmlType="submit">
												Sell
											</Button>
										</Form.Item>
									</Form>
								</Col>
							</Row>
						</Card>
					</Col>
				</Row>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			// user: state.user,
			exchangeRates: state.assets.rates,
			wallet: state.wallet,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
		exchangeAssets: Actions.exchangeAssets.exchangeAssets,
	}
)(AssetsExchange);
