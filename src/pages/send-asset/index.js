import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, Row, Col, Typography, InputNumber, Alert } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { sendAsset, getFee } from "../../api/assets";
import { TimeoutError } from "promise-timeout";
import { isBase58Address, countDecimals } from "../../utils/validate";
import { convertAmountToStr } from "../../utils/number";
import { showNotification, showBcError, showTimeoutNotification } from "components/notification";
import { debounce } from "lodash";
import { refreshBalance } from "providers/balanceProvider";
import AvailableBalance from "components/balance/AvailableBalance";
import { handleBcError } from "api/network";
import { checkUserRole, isBlockedUser } from "api/admin/users";
import { roles } from "api/constants";
import { trimAddress } from "utils";
import { push } from "connected-react-router";
import { handleReqError } from "api/network";

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
				const maxAmountFeePercent = parseFloat((fee / asset.amount).toFixed(8));
				let amountToSend = (
					convertAmountToStr(asset.amount, 8) /
					(1 + maxAmountFeePercent)
				).toFixed(8);
				let updatedFee = (await getFee(assetSymbol, amountToSend.toString(), "send")) / 10 ** 8;
				const updatedAmountFeePercent = parseFloat((updatedFee / amountToSend).toFixed(8));
				if (maxAmountFeePercent !== updatedAmountFeePercent) {
					amountToSend = (amountToSend / (1 + updatedAmountFeePercent)).toFixed(8);
					updatedFee = (await getFee(assetSymbol, amountToSend.toString(), "send")) / 10 ** 8;
				}
				if (updateFee) {
					this.setState({ fee: updatedFee });
				}
				return amountToSend;
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
			const { user, push } = this.props;
			if (user && user.role === roles.c) {
				// user can't send to agents or super-agents
				const isReceiverAgentPromise = checkUserRole(values.receiverAddress, "IsAgent");
				const isReceiverSuperAgentPromise = checkUserRole(values.receiverAddress, "IsSuperAgent");
				const [isReceiverAgent, isReceiverSuperAgent] = await Promise.all([
					isReceiverAgentPromise,
					isReceiverSuperAgentPromise,
				]);

				if (isReceiverAgent || isReceiverSuperAgent) {
					formActions.setSubmitting(false);
					return formActions.setFieldError(
						"receiverAddress",
						"Assets cannot be sent to Agents or Super agents"
					);
				}
			}

			const isReceiverBlocked = await isBlockedUser(values.receiverAddress);
			if (isReceiverBlocked) {
				formActions.setSubmitting(false);
				return formActions.setFieldError(
					"receiverAddress",
					"Assets cannot be sent to a blocked account"
				);
			}

			const isEnteredEnoughAmount = this.isEnteredEnoughAmount(values.amount, values.assetSymbol);
			if (!isEnteredEnoughAmount) {
				formActions.setSubmitting(false);
				return formActions.setFieldError("amount", "Min amount is 1 oUSD");
			}
			const isEnteredAmountOverBalance = await this.isEnteredAmountOverBalance(
				values.amount,
				values.assetSymbol
			);
			if (isEnteredAmountOverBalance) {
				const maxAmount = await this.calcMaxAmount(values.assetSymbol);
				formActions.setSubmitting(false);
				return formActions.setFieldError("amount", `Max amount is ${maxAmount}`);
			}
			if (isEnteredEnoughAmount && !isEnteredAmountOverBalance) {
				await sendAsset(values, push);

				showNotification({
					type: "success",
					msg: "Success",
					desc: `You have successfully sent ${values.amount} ${values.assetSymbol} to ${trimAddress(
						values.receiverAddress
					)} address`,
				});
				refreshBalance();
			}
		} catch (e) {
			if (e instanceof TimeoutError) {
				formActions.resetForm();
				showTimeoutNotification();
				refreshBalance();
			} else if (e.isAxiosError) {
				handleReqError(e);
			} else {
				handleBcError(e);
			}
		} finally {
			formActions.setSubmitting(false);
		}
	};

	debouncedGetFee(assetSymbol, amount) {
		getFee(assetSymbol, amount, "send").then(fee => {
			this.setState({ fee: fee / 10 ** 8 });
		});
	}

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("assetSymbol", value);
	};

	handleAmountChange = (values, formActions) => async value => {
		const isEnteredEnoughAmount = this.isEnteredEnoughAmount(value, values.assetSymbol);
		if (isEnteredEnoughAmount) {
			this.debouncedGetFee(values.assetSymbol, value);
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
				<Card>
					<Alert
						style={{ marginBottom: 10 }}
						message={
							"You are allowed to send assets only to users. In order to send assets, you need to know the address of the recipient’s wallet."
						}
						type="info"
					/>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							receiverAddress: "",
							assetSymbol: "",
							amount: "",
						}}
						validate={values => {
							let errors = {};
							if (!values.receiverAddress) {
								errors.receiverAddress = "Required field";
							} else if (!isBase58Address(values.receiverAddress)) {
								errors.receiverAddress = "Recipient's address should be in base58 format";
							}
							if (!values.assetSymbol) {
								errors.assetSymbol = "Required field";
							}
							if (values.amount === null || values.amount === "") {
								errors.amount = "Required field";
							} else if (values.amount <= 0) {
								errors.amount = "Only positive values are allowed";
							} else if (countDecimals(values.amount) > 8) {
								errors.amount = "Max number of decimal places is 8";
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
								values.receiverAddress && values.assetSymbol && values.amount ? true : false;
							return (
								<form onSubmit={handleSubmit} className="assets__form">
									<Row gutter={16}>
										<Col lg={8} md={24}>
											<Form.Item
												className="ant-form-item--lh32"
												label="Enter the recipient’s wallet address"
												required
												validateStatus={
													errors.receiverAddress && touched.receiverAddress ? "error" : ""
												}
												help={
													errors.receiverAddress && touched.receiverAddress
														? errors.receiverAddress
														: ""
												}
											>
												<Input
													name="receiverAddress"
													placeholder="EXAMPLE: pNe6RAWK6EzTwcKA8uu3r2bARgUc5RC7yZ"
													value={values.receiverAddress}
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
												validateStatus={errors.assetSymbol && touched.assetSymbol ? "error" : ""}
												help={errors.assetSymbol && touched.assetSymbol ? errors.assetSymbol : ""}
											>
												<Select
													showSearch
													name="assetSymbol"
													placeholder="Select asset"
													optionFilterProp="children"
													value={values.assetSymbol ? values.assetSymbol : undefined}
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
											{values.assetSymbol && <AvailableBalance assetSymbol={values.assetSymbol} />}
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
															!availableAssetsToSend.length || !values.assetSymbol || isSubmitting
														}
														style={{ width: "100%" }}
													/>
													<Button
														onClick={this.handleMaxAmount(values.assetSymbol, setFieldValue)}
														disabled={
															!availableAssetsToSend.length || !values.assetSymbol || isSubmitting
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
													Transaction fee: {fee}
												</Text>
											)}
										</Col>
									</Row>
									<TextAligner align="right" mobile="left" className="assets__button-wrapper">
										<Button
											type="primary"
											htmlType="submit"
											disabled={!allowToSubmitForm || isSubmitting}
											loading={isSubmitting}
										>
											Send
										</Button>
									</TextAligner>
									<Alert
										style={{ marginTop: 16 }}
										message={
											availableAssetsToSend.length !== 0
												? "The minimum available amount to send is 1 USD or its equivalent in other currencies."
												: "You have no assets to send at the moment. Please, make a deposit."
										}
										type={availableAssetsToSend.length !== 0 ? "info" : "error"}
									/>
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
		push,
	}
)(SendAsset);
