import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, Row, Col, Alert } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { push } from "connected-react-router";
import { createRequest, getActiveRequestsCounter } from "api/requests";
import { TimeoutError } from "promise-timeout";
import { convertAmountToStr } from "utils/number";
import { isAssetBlocked } from "api/assets";
import AssetsBalance from "components/balance/AssetsBalance";
import { countDecimals } from "utils/validate";
import {
	showNotification,
	showTimeoutNotification,
	showGasCompensationError,
	showBcError,
} from "components/notification";
import { GasCompensationError, SendRawTrxError } from "utils/custom-error";
import { getSettlementsByUserId } from "api/settlement-accounts";

const { Option } = Select;

class Withdraw extends Component {
	state = {
		activeRequestsError: false,
	};

	async componentDidMount() {
		const { getExchangeRates, getSettlementsList, user } = this.props;
		const data = await getSettlementsByUserId(user.id);
		if (!data.items.length) {
			alert(1);
		}
		console.log(data);
		getExchangeRates();
		const counter = await getActiveRequestsCounter();
		if (process.env.NODE_ENV === "development") {
			console.log("activeRequestsCounter", counter);
		}
		if (counter > 10) {
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

	calcMaxAmount(assetSymbol) {
		const { assets } = this.props;
		const asset = assets.find(asset => asset.symbol === assetSymbol);
		return convertAmountToStr(asset.amount, 8);
	}

	isAmountNotOverMax = (amount, assetSymbol) => {
		const maxAmount = this.calcMaxAmount(assetSymbol);
		return amount <= maxAmount;
	};

	handleMaxAmount = (assetSymbol, setFieldValue) => e => {
		const maxAmount = this.calcMaxAmount(assetSymbol);
		setFieldValue("amount", maxAmount);
	};

	handleFormSubmit = async (values, formActions) => {
		const { push } = this.props;
		try {
			const isBlocked = await isAssetBlocked(values.asset_symbol);
			const isEnoughAmount = this.isEnoughAmount(values.amount, values.asset_symbol);
			const isAmountNotOverMax = this.isAmountNotOverMax(values.amount, values.asset_symbol);

			if (isBlocked) {
				formActions.setFieldError("asset_symbol", "asset is blocked at the moment");
			}
			if (!isEnoughAmount) {
				formActions.setFieldError("amount", "min amount is 1 oUSD");
			}

			if (!isAmountNotOverMax) {
				const maxAmount = this.calcMaxAmount(values.asset_symbol);
				formActions.setFieldError("amount", `max ${maxAmount}`);
			}

			if (!isBlocked && isEnoughAmount && isAmountNotOverMax) {
				const res = await createRequest(values, "withdraw");
				if (!res.error) {
					showNotification({
						type: "success",
						msg: "Withdraw request is successfully created",
					});
					push("/active-requests/withdraw");
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
		const { assets } = this.props;
		const { activeRequestsError } = this.state;

		return (
			<>
				<PageTitle>Withdraw</PageTitle>
				<AssetsBalance />
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							asset_symbol: "oUSD",
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
															<Option key={index} value={asset.symbol}>
																{asset.symbol}
															</Option>
														);
													})}
												</Select>
											</Form.Item>
										</Col>

										<Col lg={12} md={24}>
											<Form.Item
												className="ant-form-item--lh32"
												label="Amount"
												required
												validateStatus={errors.amount && touched.amount ? "error" : ""}
												help={errors.amount && touched.amount ? errors.amount : ""}
											>
												<Input.Group compact style={{ display: "flex" }}>
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
													<Button
														onClick={this.handleMaxAmount(values.asset_symbol, setFieldValue)}
														disabled={activeRequestsError || isSubmitting}
													>
														max
													</Button>
												</Input.Group>
											</Form.Item>
										</Col>
									</Row>
									<TextAligner align="right" mobile="left">
										<Button
											type="primary"
											htmlType="submit"
											disabled={activeRequestsError || isSubmitting}
											loading={isSubmitting}
										>
											Create withdraw request
										</Button>
									</TextAligner>
									{activeRequestsError && (
										<Alert
											style={{ marginTop: 16 }}
											message="Limit of active requests(10) is exceeded. To create new requests you should resolve some of the old ones"
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
			assets: state.balance.assets,
			exchangeRates: state.assets.rates,
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
		push,
		getSettlementsList: Actions.settlements.getSettlementsList,
	}
)(Withdraw);
