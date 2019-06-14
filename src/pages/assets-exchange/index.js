import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Table, Card, Form, Divider, InputNumber, Button } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { convertAmountToStr } from "../../utils/number";
import { roles, defaultAsset } from "../../api/constants";

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

function recordToAssetData(record) {
	return {
		name: record.key || "",
		buyPrice: record.buyPrice || 0,
		sellPrice: record.sellPrice || 0,
	};
}

class AssetsExchange extends Component {
	state = {
		selectedAsset: { name: "", buyPrice: 0, sellPrice: 0 },
		defaultAsset: { name: defaultAsset.symbol, buyPrice: 0, sellPrice: 0 },
		buyAmount: 0,
		sellAmount: 0,
	};

	async componentDidMount() {
		const { getExchangeRates } = this.props;
		const { exchangeRates } = this.props;

		await getExchangeRates();
		let data = [];
		for (let record of exchangeRates) {
			if (this.props.user.role === roles.c && record.symbol !== defaultAsset.symbol) {
				data.push({
					key: record.symbol,
					name: record.symbol,
					buyPrice: convertAmountToStr(record.buy, 8),
					sellPrice: convertAmountToStr(record.sell, 8),
				});
			}
		}
		this.setState({
			assetPricesData: data,
			primaryAsset: recordToAssetData(
				exchangeRates.find(record => record.symbol === defaultAsset.symbol)
			),
			selectedAsset: recordToAssetData(data[0]),
		});
	}

	onActiveAssedChanged = async record => {
		await this.setState({
			selectedAsset: recordToAssetData(record),
		});
	};

	handleBuyAmountChange = async value => {
		await this.setState({ buyAmount: value });
	};

	handleSellAmountChange = async value => {
		await this.setState({ sellAmount: value });
	};

	handleSubmit = async (e, operationType) => {
		e.preventDefault();
		e.stopPropagation();

		const { selectedAsset, buyAmount, sellAmount } = this.state;
		try {
			await this.props.exchangeAssets({
				operationType: operationType,
				assetName: selectedAsset.name,
				amountToBuy: operationType === "buy" ? buyAmount : sellAmount * selectedAsset.sellPrice,
				wallet: this.props.wallet,
			});
		} catch (e) {
			console.log("error: ", e);
		}
	};

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
							dataSource={this.state.assetPricesData}
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
			user: state.user,
			exchangeRates: state.assets.rates,
			wallet: state.wallet,
			exchange_successful: state.exchange_successful,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
		exchangeAssets: Actions.exchangeAssets.exchangeAssets,
	}
)(AssetsExchange);
