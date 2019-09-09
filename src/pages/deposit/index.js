import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, Row, Col, Alert } from "antd";
import { Formik } from "formik";
import { PageTitle } from "components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { push } from "connected-react-router";
import { createRequest, getActiveRequestsCounter } from "api/requests";
import { TimeoutError } from "promise-timeout";
import { isAssetBlocked } from "api/assets";
import { countDecimals } from "utils/validate";
import { roles, onyxCashSymbol } from "api/constants";
import {
	showNotification,
	showTimeoutNotification,
	showGasCompensationError,
	showBcError,
} from "components/notification";
import { GasCompensationError, SendRawTrxError } from "utils/custom-error";

const { Option } = Select;

class Deposit extends Component {
	state = {
		activeRequestsError: false,
	};

	async componentDidMount() {
		const { getAssetsList, getExchangeRates } = this.props;
		getAssetsList();
		getExchangeRates();
		const counter = await getActiveRequestsCounter();
		if (process.env.NODE_ENV === "development") {
			console.log("activeRequestsCounter", counter);
		}
		if (counter >= 10) {
			this.setState({ activeRequestsError: true });
		}
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
					return formActions.setFieldError("asset_symbol", "Asset is blocked at the moment");
				}

				isEnoughAmount = this.isEnoughAmount(values.amount, values.asset_symbol);
				if (!isEnoughAmount) {
					formActions.setSubmitting(false);
					return formActions.setFieldError("amount", "Min amount is 1 USD");
				}
			}

			if (!isBlocked && isEnoughAmount) {
				const res = await createRequest(values, requestType);
				if (!res.error) {
					showNotification({
						type: "success",
						msg: "Deposit request has been successfully created",
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
				showGasCompensationError(e.message);
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
		const { activeRequestsError } = this.state;

		return (
			<>
				<PageTitle
					tooltip={{
						title:
							user.role === roles.c && !activeRequestsError
								? "To deposit assets from agent you will have to send corresponding fiat currency to the agent's account."
								: "To deposit OnyxCash from super agent you will have to send corresponding fiat currency to the super agent's account.",
					}}
				>
					Deposit {user.role === roles.c ? "assets" : "OnyxCash"}
				</PageTitle>
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
								errors.asset_symbol = "Required field";
							}
							if (!values.amount) {
								errors.amount = "Required field";
							} else if (values.amount <= 0) {
								errors.amount = "Only positive values are allowed";
							} else if ((user.role === roles.a || user.role === roles.sa) && values.amount < 1) {
								errors.amount = `Min amount is 1 ${onyxCashSymbol}`;
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
						}) => {
							return (
								<form onSubmit={handleSubmit} className="assets__form">
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
														disabled={activeRequestsError || isSubmitting}
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
													<Input name="asset_symbol" value={values.asset_symbol} />
												)}
											</Form.Item>
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
													disabled={activeRequestsError || isSubmitting}
													step="any"
												/>
											</Form.Item>
										</Col>
									</Row>
									<TextAligner align="right" mobile="left" className="assets__button-wrapper">
										<Button
											type="primary"
											htmlType="submit"
											disabled={activeRequestsError || isSubmitting}
											loading={isSubmitting}
										>
											Create deposit request
										</Button>
									</TextAligner>
									{activeRequestsError && (
										<Alert
											style={{ marginTop: 16 }}
											message="Limit of active deposit and withdraw requests (10) is exceeded. To create new requests you should resolve some of the old ones."
											type="error"
										/>
									)}
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
