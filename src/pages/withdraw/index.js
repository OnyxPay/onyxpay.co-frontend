import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, notification, Row, Col, message } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { push } from "connected-react-router";
import { createRequest } from "../../api/requests";
import { TimeoutError } from "promise-timeout";
import { convertAmountToStr } from "../../utils/number";
import { isAssetBlocked } from "../../api/assets";

const { Option } = Select;

class Withdraw extends Component {
	componentDidMount() {
		const { getExchangeRates } = this.props;
		getExchangeRates();
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
				alert("Yo");
				// const res = await createRequest(values);
				// if (!res.error) {
				// 	notification.success({
				// 		message: "Done",
				// 		description: "Deposit request is successfully created",
				// 	});
				// 	push("/active-requests");
				// } else if (res.error.data) {
				// 	formActions.setErrors(res.error.data);
				// }
			}
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		}

		formActions.setSubmitting(false);
	};

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
	};

	render() {
		const { assets } = this.props;

		return (
			<>
				<PageTitle>Withdraw</PageTitle>
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
													disabled={isSubmitting}
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
														disabled={isSubmitting}
													/>
													<Button
														onClick={this.handleMaxAmount(values.asset_symbol, setFieldValue)}
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
											disabled={isSubmitting}
											loading={isSubmitting}
										>
											Create withdraw request
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
		push,
	}
)(Withdraw);
