import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, Row, Col, Alert, Typography, InputNumber } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "redux/actions";
import { TextAligner } from "../../components/styled";
import { push } from "connected-react-router";
import { createRequest, getActiveRequestsCounter } from "api/requests";
import { TimeoutError } from "promise-timeout";
import { convertAmountToStr } from "utils/number";
import { isAssetBlocked } from "api/assets";
import { countDecimals } from "utils/validate";
import {
	showNotification,
	showTimeoutNotification,
	showGasCompensationError,
	showBcError,
} from "components/notification";
import { GasCompensationError, SendRawTrxError } from "utils/custom-error";
import { Link } from "react-router-dom";
import { createLoadingSelector } from "selectors/loading";
import { FETCH_SETTLEMENTS_LIST } from "redux/settlements";
import { getFee } from "../../api/assets";
import AvailableBalance from "components/balance/AvailableBalance";
import { debounce } from "lodash";
import { sortAssetSymbol } from "api/assets";

const { Text } = Typography;
const { Option } = Select;

class Withdraw extends Component {
	constructor(props) {
		super(props);
		this.debouncedGetFee = debounce(this.debouncedGetFee.bind(this), 500);
		this.state = {
			fee: null,
			activeRequestsError: false,
			settlementsError: false,
		};
	}

	async componentDidMount() {
		const { getExchangeRates, getSettlementsList } = this.props;
		getExchangeRates();
		getSettlementsList();
		const counter = await getActiveRequestsCounter();
		if (process.env.NODE_ENV === "development") {
			console.log("activeRequestsCounter", counter);
		}
		if (counter >= 10) {
			this.setState({ activeRequestsError: true });
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const { isSettlementsFetching, settlements } = this.props;
		const { settlementsError } = this.state;

		if (prevProps.isSettlementsFetching && !isSettlementsFetching && !settlements.length) {
			this.setState({ settlementsError: true });
		} else if (prevProps.settlements.length !== settlements.length && settlementsError) {
			this.setState({ settlementsError: false });
		}
	}

	isEnteredEnoughAmount(amount, assetSymbol) {
		const { exchangeRates } = this.props;
		const rate = exchangeRates.find(rate => rate.symbol === assetSymbol);
		const rateUSD = exchangeRates.find(rate => rate.symbol === "oUSD");
		const isEnough = rateUSD.sell <= rate.sell * amount;
		return isEnough;
	}

	async calcMaxAmount(assetSymbol, updateFee) {
		const { assets } = this.props;
		if (assets.length) {
			try {
				const asset = assets.find(asset => asset.symbol === assetSymbol);
				const fee = await getFee(assetSymbol, convertAmountToStr(asset.amount, 8), "withdraw");
				const maxAmountFeePercent = parseFloat((fee / asset.amount).toFixed(8));
				let maxAmount = (convertAmountToStr(asset.amount, 8) / (1 + maxAmountFeePercent)).toFixed(
					8
				);
				let updatedFee = (await getFee(assetSymbol, maxAmount.toString(), "withdraw")) / 10 ** 8;
				const updatedAmountFeePercent = parseFloat((updatedFee / maxAmount).toFixed(8));
				if (maxAmountFeePercent !== updatedAmountFeePercent) {
					maxAmount = (maxAmount / (1 + updatedAmountFeePercent)).toFixed(8);
					updatedFee = (await getFee(assetSymbol, maxAmount.toString(), "withdraw")) / 10 ** 8;
				}
				if (updateFee) {
					this.setState({ fee: updatedFee });
				}
				return maxAmount;
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

	handleFormSubmit = async (values, formActions) => {
		const { push } = this.props;
		try {
			const isBlocked = await isAssetBlocked(values.asset_symbol);
			if (isBlocked) {
				formActions.setSubmitting(false);
				return formActions.setFieldError("asset_symbol", "Asset is blocked at the moment");
			}
			const isEnteredEnoughAmount = this.isEnteredEnoughAmount(values.amount, values.asset_symbol);

			if (!isEnteredEnoughAmount) {
				formActions.setSubmitting(false);
				return formActions.setFieldError("amount", "Min amount is 1 oUSD");
			}
			const maxAmount = await this.calcMaxAmount(values.asset_symbol);

			if (Number(maxAmount) < Number(values.amount)) {
				formActions.setSubmitting(false);
				return formActions.setFieldError("amount", `Max amount is ${maxAmount}`);
			}

			if (!isBlocked && isEnteredEnoughAmount) {
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
		} finally {
			formActions.setSubmitting(false);
		}
	};

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
	};

	debouncedGetFee(assetSymbol, amount) {
		getFee(assetSymbol, amount, "withdraw").then(fee => {
			this.setState({ fee: fee / 10 ** 8 });
		});
	}

	handleAmountChange = (values, formActions) => async value => {
		const isEnteredEnoughAmount = this.isEnteredEnoughAmount(value, values.asset_symbol);

		if (isEnteredEnoughAmount) {
			this.debouncedGetFee(values.asset_symbol, value);
		} else {
			if (this.state.fee) {
				this.setState({ fee: null });
			}
		}
		formActions.setFieldValue("amount", value);
	};

	render() {
		const { assets } = this.props;
		const { activeRequestsError, settlementsError, fee } = this.state;

		const isFormDisabled = settlementsError || activeRequestsError;

		sortAssetSymbol(assets);

		return (
			<>
				<PageTitle
					tooltip={{
						title: "You may withdraw assets by sending a fiat payment to the agent's account",
					}}
				>
					Withdraw assets
				</PageTitle>

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
								errors.asset_symbol = "Required field";
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
						}) => {
							return (
								<form onSubmit={handleSubmit} className="assets__form">
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
													disabled={isFormDisabled || isSubmitting}
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
											{!isFormDisabled && <AvailableBalance assetSymbol={values.asset_symbol} />}
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
														disabled={isFormDisabled || isSubmitting}
														style={{ width: "100%" }}
													/>
													<Button
														onClick={this.handleMaxAmount(values.asset_symbol, setFieldValue)}
														disabled={isFormDisabled || isSubmitting}
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
													Transaction fee: [{fee}]
												</Text>
											)}
										</Col>
									</Row>
									<TextAligner align="right" mobile="left" className="assets__button-wrapper">
										<Button
											type="primary"
											htmlType="submit"
											disabled={isFormDisabled || isSubmitting}
											loading={isSubmitting}
										>
											Create withdraw request
										</Button>
									</TextAligner>
									{settlementsError && (
										<Alert
											style={{ marginTop: 16 }}
											message={
												<div>
													To create a withdraw request you should have at least one settlement
													account. Please,&nbsp;
													<Link to="/settlement-accounts">create one</Link>.
												</div>
											}
											type="error"
										/>
									)}
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

const loadingSelector = createLoadingSelector([FETCH_SETTLEMENTS_LIST]);

export default connect(
	state => {
		return {
			user: state.user,
			assets: state.balance.assets,
			exchangeRates: state.assets.rates,
			settlements: state.settlements,
			isSettlementsFetching: loadingSelector(state),
		};
	},
	{
		getExchangeRates: Actions.assets.getExchangeRates,
		getSettlementsList: Actions.settlements.getSettlementsList,
		push,
	}
)(Withdraw);
