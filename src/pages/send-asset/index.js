import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Input, Form, Select, notification, Row, Col, message } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { sendAsset } from "../../api/assets";
import { TimeoutError } from "promise-timeout";

const { Option } = Select;

class SendAsset extends Component {
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

	handleFormSubmit = async (values, formActions) => {
		const { push } = this.props;
		try {
			const isEnoughAmount = this.isEnoughAmount(values.amount, values.asset_symbol);
			if (!isEnoughAmount) {
				formActions.setFieldError("amount", "min amount is 1 oUSD");
				// TODO: check max amount
			}
			if (isEnoughAmount) {
				await sendAsset(values);
				formActions.resetForm();
				notification.success({
					message: "Done",
					description: `You have successfully sent ${values.amount} ${values.asset_symbol} to ${
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

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
	};

	render() {
		const { assets } = this.props;
		console.log(assets);

		return (
			<>
				<PageTitle>Send assets</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							receiver_address: "",
							asset_symbol: "oUSD",
							amount: "",
						}}
						validate={values => {
							let errors = {};
							if (!values.receiver_address) {
								errors.receiver_address = "required";
							}
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
										<Col lg={8} md={24}>
											<Form.Item
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
													disabled={isSubmitting}
												/>
											</Form.Item>
										</Col>

										<Col lg={8} md={24}>
											<Form.Item
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

										<Col lg={8} md={24}>
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
