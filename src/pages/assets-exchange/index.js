import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Table, Card, Form, Divider, InputNumber, Button, notification } from "antd";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import styled from "styled-components";
import { convertAmountToStr } from "../../utils/number";
import { roles, defaultAsset } from "../../api/constants";
import { exchangeAssets } from "../../api/exchange";
import { TimeoutError } from "promise-timeout";
import { SendRawTrxError } from "../../utils/custom-error";

const Container = styled.div`
	.selectedRow {
		background-color: #40a9ff;
		color: white;
		&:hover {
			color: #595959;
		}
	}
`;

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
		assetPricesData: [],
		selectedAsset: { name: "", buyPrice: 0, sellPrice: 0 },
		defaultAsset: { name: defaultAsset.symbol, buyPrice: 0, sellPrice: 0 },
		buyAmount: 0,
		sellAmount: 0,
	};

	async componentDidMount() {
		const { getExchangeRates } = this.props;
		await getExchangeRates();
		const { exchangeRates } = this.props;

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
		let defaultAssetData = exchangeRates.find(record => record.symbol === defaultAsset.symbol);
		this.setState({
			assetPricesData: data,
			defaultAsset: {
				name: defaultAssetData.symbol,
				buyPrice: defaultAssetData.buy / 10 ** 8,
				sellPrice: defaultAssetData.sell / 10 ** 8,
			},
			selectedAsset: recordToAssetData(data[0]),
		});
	}

	onActiveAssetChanged = async record => {
		this.setState({
			selectedAsset: recordToAssetData(record),
		});
	};

	setRowClassName = record => {
		return record.key === this.state.selectedAsset.name ? "selectedRow" : "";
	};

	handleBuyAmountChange = async value => {
		this.setState({ buyAmount: value });
	};

	handleSellAmountChange = async value => {
		this.setState({ sellAmount: value });
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

		const { selectedAsset, buyAmount, sellAmount } = this.state;
		try {
			let result = await exchangeAssets({
				operationType: operationType,
				assetName: selectedAsset.name,
				amountToBuy: operationType === "buy" ? buyAmount : sellAmount * selectedAsset.sellPrice,
				wallet: this.props.wallet,
			});
			this.openNotification(result.Error === 0 ? "success" : "error");
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
		}
	};

	render() {
		const formItemLayout = {
			labelCol: { offset: 1, span: 7 },
			wrapperCol: { span: 16 },
		};

		return (
			<>
				<PageTitle>Assets Exchange</PageTitle>
				<Row gutter={16}>
					<Col md={24} lg={12}>
						<Container>
							<Table
								onRow={record => ({
									onClick: e => this.onActiveAssetChanged(record),
								})}
								rowClassName={this.setRowClassName}
								columns={columns}
								dataSource={this.state.assetPricesData}
								pagination={false}
								expandRowByClick={true}
							/>
						</Container>
					</Col>
					<Col md={24} lg={12}>
						<Card>
							<Row gutter={16}>
								<Col md={24} lg={12}>
									<Form
										layout="vertical"
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
											<span className="ant-form-text"> {this.state.selectedAsset.name} </span>
										</Form.Item>

										<Form.Item label="Total: ">
											<span className="ant-form-text">
												{(this.state.selectedAsset.buyPrice * this.state.buyAmount) /
													this.state.defaultAsset.sellPrice || 0}
											</span>
											<span className="ant-form-text"> {this.state.defaultAsset.name} </span>
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
										layout="vertical"
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
											<span className="ant-form-text"> {this.state.selectedAsset.name} </span>
										</Form.Item>

										<Form.Item label="Total: ">
											<span className="ant-form-text">
												{this.state.selectedAsset.sellPrice * this.state.sellAmount || 0}
											</span>
											<span className="ant-form-text"> {this.state.defaultAsset.name} </span>
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
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(AssetsExchange);
