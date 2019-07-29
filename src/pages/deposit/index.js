import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, Typography, Row, Col } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { push } from "connected-react-router";
import { createRequest } from "../../api/requests";
import { TimeoutError } from "promise-timeout";
import { isAssetBlocked } from "../../api/assets";
import { countDecimals } from "../../utils/validate";
import { roles, onyxCashSymbol } from "api/constants";
import {
	showNotification,
	showTimeoutNotification,
	showGasCompensationError,
	showBcError,
} from "components/notification";
import { GasCompensationError, SendRawTrxError } from "utils/custom-error";

const { Option } = Select;
const { Text } = Typography;

class Deposit extends Component {
	componentDidMount() {
		const { getAssetsList, getExchangeRates } = this.props;
		getAssetsList();
		getExchangeRates();
	}

	isEnoughAmount(amount, assetSymbol) {
		const { exchangeRates } = this.props;
		const rate = exchangeRates.find(rate => rate.symbol === assetSymbol);
		const rateUSD = exchangeRates.find(rate => rate.symbol === "oUSD");
		const isEnough = rateUSD.sell <= rate.sell * amount;
		return isEnough;
	}

	handleFormSubmit = async (formValues, formActions) => {
		const { push } = this.props;
		const values = { ...formValues }; // don't mutate formValues
		const isOnyxCash = values.asset_symbol === onyxCashSymbol;
		let isEnoughAmount = true;
		let requestType = "deposit";
		let isBlocked;

		if (isOnyxCash) {
			values.asset_symbol = "OnyxCash";
			requestType = "buy_onyx_cash";
		}

		try {
			if (!isOnyxCash) {
				isBlocked = await isAssetBlocked(values.asset_symbol);
				if (isBlocked) {
					formActions.setSubmitting(false);
					return formActions.setFieldError("asset_symbol", "asset is blocked at the moment");
				}

				isEnoughAmount = this.isEnoughAmount(values.amount, values.asset_symbol);
				if (!isEnoughAmount) {
					formActions.setSubmitting(false);
					return formActions.setFieldError("amount", "min amount is 1 USD");
				}
			}

			if (!isBlocked && isEnoughAmount) {
				const res = await createRequest(values, requestType);
				if (!res.error) {
					showNotification({
						type: "success",
						msg: "Deposit request is successfully created",
					});
					if (isOnyxCash) {
						push("/active-requests/deposit-onyx-cash");
					} else {
						push("/active-requests/deposit");
					}
				} else if (res.error.data) {
					formActions.setErrors(res.error.data);
				}
			}
		} catch (e) {
			if (e instanceof GasCompensationError) {
				showGasCompensationError();
			} else if (e instanceof SendRawTrxError) {
				showBcError(e.message);
			} else if (e instanceof TimeoutError) {
				showTimeoutNotification();
			}
		}

		formActions.setSubmitting(false);
	};

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
	};

	render() {
		const { assets, user } = this.props;

		return (
			<>
				<PageTitle>Deposit</PageTitle>

				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							asset_symbol: user.role === roles.c ? "oUSD" : onyxCashSymbol,
							amount: "",
						}}
						validate={values => {
							let errors = {};
							if (!values.asset_symbol) {
								errors.asset_symbol = "required";
							}
							if (!values.amount) {
								errors.amount = "required";
							} else if (values.amount <= 0) {
								errors.amount = "only positive values are allowed";
							} else if ((user.role === roles.a || user.role === roles.sa) && values.amount < 1) {
								errors.amount = `min amount is 1 ${onyxCashSymbol}`;
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
						}) => {
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={16}>
										<Col lg={12} md={24}>
											<Form.Item
												label="Asset"
												required
												validateStatus={errors.asset_symbol && touched.asset_symbol ? "error" : ""}
												help={
													errors.asset_symbol && touched.asset_symbol ? errors.asset_symbol : ""
												}
											>
												{user.role === roles.c ? (
													<Select
														showSearch
														name="asset_symbol"
														placeholder="Select an asset"
														optionFilterProp="children"
														value={values.asset_symbol}
														onChange={this.handleAssetChange(setFieldValue)}
														filterOption={(input, option) =>
															option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
														}
														disabled={isSubmitting}
													>
														{assets.map((asset, index) => {
															return (
																<Option key={index} value={asset}>
																	{asset}
																</Option>
															);
														})}
													</Select>
												) : (
													<Input name="asset_symbol" disabled={true} value={values.asset_symbol} />
												)}
											</Form.Item>
											{user.role === roles.c ? (
												<Text
													type="secondary"
													style={{ display: "block", margin: "-12px 0 12px 0" }}
												>
													You will be able to send to the agent only chosen fiat currency
												</Text>
											) : null}
										</Col>

										<Col lg={12} md={24}>
											<Form.Item
												label="Amount"
												required
												validateStatus={errors.amount && touched.amount ? "error" : ""}
												help={errors.amount && touched.amount ? errors.amount : ""}
											>
												<Input
													name="amount"
													type="number"
													placeholder="Enter an amount"
													value={values.amount}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
													step="any"
												/>
											</Form.Item>
										</Col>
									</Row>
									<TextAligner align="right" mobile="left">
										<Button
											type="primary"
											htmlType="submit"
											disabled={isSubmitting}
											loading={isSubmitting}
										>
											Create deposit request
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
			assets: state.assets.list,
			exchangeRates: state.assets.rates,
		};
	},
	{
		getAssetsList: Actions.assets.getAssetsList,
		getExchangeRates: Actions.assets.getExchangeRates,
		push,
	}
)(Deposit);
