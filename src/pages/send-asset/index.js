import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, Row, Col, Typography, InputNumber } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { sendAsset, getFee } from "../../api/assets";
import { TimeoutError } from "promise-timeout";
import { isBase58Address, countDecimals } from "../../utils/validate";
import { convertAmountToStr, minus } from "../../utils/number";
import { showNotification, showBcError, showTimeoutNotification } from "components/notification";
import { debounce } from "lodash";
import { refreshBalance } from "providers/balanceProvider";
import AssetsBalance from "components/balance/AssetsBalance";
import { handleBcError } from "api/network";

const { Option } = Select;
const { Text } = Typography;

class SendAsset extends Component {
	constructor(props) {
		super(props);
		this.debouncedGetFee = debounce(this.debouncedGetFee.bind(this), 500);
		this.state = {
			fee: null,
		};
	}

	componentDidMount() {
		const { getExchangeRates } = this.props;
		getExchangeRates();
	}

	async calcMaxAmount(assetSymbol, updateFee) {
		const { assets } = this.props;
		if (assets.length) {
			try {
				const asset = assets.find(asset => asset.symbol === assetSymbol);
				const fee = await getFee(assetSymbol, convertAmountToStr(asset.amount, 8), "send");
				if (updateFee) {
					this.setState({ fee: fee / 10 ** 8 });
				}
				return minus(asset.amount, fee) / 10 ** 8;
			} catch (e) {
				showBcError(e.message);
				return 0;
			}
		}
	}

	handleMaxAmount = (assetSymbol, setFieldValue) => async e => {
		const maxAmount = await this.calcMaxAmount(assetSymbol, true);
		setFieldValue("amount", maxAmount);
	};

	isEnteredAmountOverBalance = async (amount, assetSymbol) => {
		const maxAmount = await this.calcMaxAmount(assetSymbol);
		return amount > maxAmount;
	};

	isEnteredEnoughAmount(amount, assetSymbol) {
		const { exchangeRates } = this.props;
		const rate = exchangeRates.find(rate => rate.symbol === assetSymbol);
		const rateUSD = exchangeRates.find(rate => rate.symbol === "oUSD");
		const isEnough = rateUSD.sell <= rate.sell * amount;
		return isEnough;
	}

	handleFormSubmit = async (values, formActions) => {
		try {
			const isEnteredEnoughAmount = this.isEnteredEnoughAmount(values.amount, values.asset_symbol);
			if (!isEnteredEnoughAmount) {
				formActions.setSubmitting(false);
				return formActions.setFieldError("amount", "min amount is 1 oUSD");
			}
			const isEnteredAmountOverBalance = await this.isEnteredAmountOverBalance(
				values.amount,
				values.asset_symbol
			);
			if (isEnteredAmountOverBalance) {
				const maxAmount = await this.calcMaxAmount(values.asset_symbol);
				formActions.setSubmitting(false);
				return formActions.setFieldError("amount", `max ${maxAmount}`);
			}
			if (isEnteredEnoughAmount && !isEnteredAmountOverBalance) {
				await sendAsset(values);
				formActions.resetForm();
				showNotification({
					type: "success",
					msg: "Success",
					desc: `You have successfully sent ${values.amount} ${values.asset_symbol} to ${
						values.receiver_address
					} address`,
				});
				refreshBalance();
			}
		} catch (e) {
			if (e instanceof TimeoutError) {
				formActions.resetForm();
				showTimeoutNotification();
				refreshBalance();
			} else {
				handleBcError(e);
			}
		}

		formActions.setSubmitting(false);
	};

	debouncedGetFee(assetSymbol, amount) {
		getFee(assetSymbol, amount, "send").then(fee => {
			this.setState({ fee: fee / 10 ** 8 });
		});
	}

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
	};

	handleAmountChange = (values, formActions) => async value => {
		const isEnteredEnoughAmount = this.isEnteredEnoughAmount(value, values.asset_symbol);
		// fix
		if (isEnteredEnoughAmount) {
			this.debouncedGetFee(values.asset_symbol, value);
		} else {
			if (this.state.fee) {
				this.setState({ fee: null });
			}
		}
		formActions.setFieldValue("amount", value);
	};

	filterAssets(assets, exchangeRates) {
		const rateUSD = exchangeRates.find(rate => rate.symbol === "oUSD");
		return assets.filter(asset => {
			const rate = exchangeRates.find(rate => rate.symbol === asset.symbol);
			if (rate) {
				return rateUSD.sell <= rate.sell * (asset.amount / 10 ** 8);
			} else {
				return false;
			}
		});
	}

	render() {
		const { assets, exchangeRates } = this.props;
		const { fee } = this.state;
		let availableAssetsToSend = [];
		if (exchangeRates.length && assets.length) {
			availableAssetsToSend = this.filterAssets(assets, exchangeRates);
		}
		return (
			<>
				<PageTitle>Send assets</PageTitle>
				<AssetsBalance />
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							receiver_address: "",
							asset_symbol: "",
							amount: "",
						}}
						validate={values => {
							let errors = {};
							if (!values.receiver_address) {
								errors.receiver_address = "required";
							} else if (!isBase58Address(values.receiver_address)) {
								errors.receiver_address = "Recipient's address should be in base58 format";
							}
							if (!values.asset_symbol) {
								errors.asset_symbol = "required";
							}
							if (values.amount === null || values.amount === "") {
								errors.amount = "required";
							} else if (values.amount <= 0) {
								errors.amount = "only positive values are allowed";
							} else if (countDecimals(values.amount) > 8) {
								errors.amount = "max number of decimal places is 8";
							}

							return errors;
						}}
					>
						{({
							values,
							errors,
							isSubmitting,
							handleChange,
							handleBlur,
							handleSubmit,
							setFieldValue,
							touched,
							setFieldError,
							validateField,
						}) => {
							const allowToSubmitForm =
								values.receiver_address && values.asset_symbol && values.amount ? true : false;
							return (
								<form onSubmit={handleSubmit} className="send-assets__form">
									<Row gutter={16}>
										<Col lg={8} md={24}>
											<Form.Item
												className="ant-form-item--lh32"
												label="Receiver address"
												required
												validateStatus={
													errors.receiver_address && touched.receiver_address ? "error" : ""
												}
												help={
													errors.receiver_address && touched.receiver_address
														? errors.receiver_address
														: ""
												}
											>
												<Input
													name="receiver_address"
													placeholder="Enter address"
													value={values.receiver_address}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={!availableAssetsToSend.length || isSubmitting}
													autoComplete="new-password"
												/>
											</Form.Item>
										</Col>

										<Col lg={8} md={24}>
											<Form.Item
												className="ant-form-item--lh32"
												label="Asset"
												required
												validateStatus={errors.asset_symbol && touched.asset_symbol ? "error" : ""}
												help={
													errors.asset_symbol && touched.asset_symbol ? errors.asset_symbol : ""
												}
											>
												<Select
													showSearch
													name="asset_symbol"
													placeholder="Select asset"
													optionFilterProp="children"
													value={values.asset_symbol ? values.asset_symbol : undefined}
													onChange={this.handleAssetChange(setFieldValue)}
													filterOption={(input, option) =>
														option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
													}
													disabled={!availableAssetsToSend.length || isSubmitting}
												>
													{availableAssetsToSend.length
														? this.filterAssets(assets, exchangeRates).map((asset, index) => {
																return (
																	<Option key={index} value={asset.symbol}>
																		{asset.symbol}
																	</Option>
																);
														  })
														: null}
												</Select>
											</Form.Item>
										</Col>

										<Col lg={8} md={24}>
											<Form.Item
												className="ant-form-item--lh32"
												label="Amount"
												required
												validateStatus={errors.amount && touched.amount ? "error" : ""}
												help={errors.amount && touched.amount ? errors.amount : ""}
											>
												<Input.Group compact style={{ display: "flex" }}>
													<InputNumber
														name="amount"
														placeholder="Enter an amount"
														value={values.amount}
														min={0}
														step={1}
														onChange={this.handleAmountChange(values, {
															setFieldError,
															setFieldValue,
														})}
														onBlur={handleBlur}
														disabled={
															!availableAssetsToSend.length || !values.asset_symbol || isSubmitting
														}
														style={{ width: "100%" }}
													/>
													<Button
														onClick={this.handleMaxAmount(values.asset_symbol, setFieldValue)}
														disabled={
															!availableAssetsToSend.length || !values.asset_symbol || isSubmitting
														}
													>
														max
													</Button>
												</Input.Group>
											</Form.Item>
											{fee && values.amount && (
												<Text
													type="secondary"
													style={{ display: "block", margin: "-12px 0 12px 0" }}
												>
													fee will be {fee}
												</Text>
											)}
										</Col>
									</Row>
									<Row>
										{availableAssetsToSend.length !== 0 ? (
											<Text type="secondary">
												Min available amount to send is equivalent of 1 USD
											</Text>
										) : (
											<Text type="danger">
												You have no assets to send at the moment. Please, make a deposit.
											</Text>
										)}
									</Row>
									<TextAligner align="right" mobile="left" className="send-assets__button-wrapper">
										<Button
											type="primary"
											htmlType="submit"
											disabled={!allowToSubmitForm || isSubmitting}
											loading={isSubmitting}
										>
											Send
										</Button>
									</TextAligner>
								</form>
							);
						}}
					</Formik>
				</Card>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			user: state.user,
			assets: state.balance.assets,
			exchangeRates: state.assets.rates,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
	}
)(SendAsset);
