import React, { Component } from "react";
import { connect } from "react-redux";
import {
	Card,
	Button,
	Input,
	Form,
	Select,
	notification,
	Row,
	Col,
	message,
	Typography,
	InputNumber,
} from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { sendAsset, getFee } from "../../api/assets";
import { TimeoutError } from "promise-timeout";
import { isBase58Address, countDecimals } from "../../utils/validate";
import { convertAmountToStr, minus } from "../../utils/number";
import { showNotification, showBcError } from "components/notification";
import { debounce } from "lodash";
const { Option } = Select;
const { Text } = Typography;

/* 
isEnteredEnoughAmount
isMinAllowedToSendAmountAvailable
*/
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

	isEnteredEnoughAmount(amount, assetSymbol) {
		const { exchangeRates } = this.props;
		const rate = exchangeRates.find(rate => rate.symbol === assetSymbol);
		const rateUSD = exchangeRates.find(rate => rate.symbol === "oUSD");
		const isEnough = rateUSD.sell <= rate.sell * amount;
		return isEnough;
	}

	async calcMaxAmount(assetSymbol) {
		const { assets } = this.props;
		if (assets.length) {
			try {
				const asset = assets.find(asset => asset.symbol === assetSymbol);
				const fee = await getFee(assetSymbol, convertAmountToStr(asset.amount, 8), "send");
				return convertAmountToStr(minus(asset.amount, fee), 8);
			} catch (e) {
				showBcError(e.message);
				return 0;
			}
		}
	}

	isAmountNotOverMax = async (amount, assetSymbol) => {
		const maxAmount = await this.calcMaxAmount(assetSymbol);
		return amount <= maxAmount;
	};

	handleMaxAmount = (assetSymbol, setFieldValue) => async e => {
		const maxAmount = await this.calcMaxAmount(assetSymbol);
		setFieldValue("amount", maxAmount);
	};

	handleFormSubmit = async (values, formActions) => {
		try {
			const isEnteredEnoughAmount = this.isEnteredEnoughAmount(values.amount, values.asset_symbol);
			if (!isEnteredEnoughAmount) {
				formActions.setSubmitting(false);
				return formActions.setFieldError("amount", "min amount is 1 oUSD");
			}

			const isAmountNotOverMax = await this.isAmountNotOverMax(values.amount, values.asset_symbol);

			if (!isAmountNotOverMax) {
				const maxAmount = await this.calcMaxAmount(values.asset_symbol);
				console.log("maxAmount", maxAmount);
				formActions.setFieldError("amount", `max ${maxAmount}`);
			}

			if (isEnteredEnoughAmount && isAmountNotOverMax) {
				await sendAsset(values);
				formActions.resetForm();
				notification.success({
					message: `You have successfully sent ${values.amount} ${values.asset_symbol} to ${
						values.receiver_address
					} address`,
				});
			}
		} catch (e) {
			if (e instanceof TimeoutError) {
				formActions.resetForm();
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check results later",
				});
			} else {
				message.error(e.message);
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
		if (value > 1) {
			this.debouncedGetFee(values.asset_symbol, value);
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
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							receiver_address: "AZPrhqNeRzC6UsDf8vfZueSTYAiB5W71gz",
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
							if (!values.amount) {
								errors.amount = "required";
							} else if (values.amount < 0) {
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
								<form onSubmit={handleSubmit}>
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
													{/* <Input
														name="amount"
														type="number"
														placeholder="Enter an amount"
														value={values.amount}
														onChange={this.handleAmountChange(values, {
															setFieldError,
															setFieldValue,
														})}
														onBlur={handleBlur}
														disabled={
															!availableAssetsToSend.length || !values.asset_symbol || isSubmitting
														}
														min={0.1}
														step="any"
													/> */}
													<InputNumber
														name="amount"
														placeholder="Enter an amount"
														value={values.amount}
														min={1 / 10 ** 8}
														step={1}
														// precision={8}
														onChange={this.handleAmountChange(values, {
															setFieldError,
															setFieldValue,
														})}
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
										<Text type="secondary">
											Min available amount to send is equivalent of 1 USD
										</Text>
									</Row>
									<TextAligner align="right" mobile="left">
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
