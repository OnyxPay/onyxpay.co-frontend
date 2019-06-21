import React, { Component } from "react";
import { connect } from "react-redux";
import {
	Card,
	Button,
	Input,
	Form,
	Select,
	Typography,
	notification,
	Row,
	Col,
	message,
} from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { push } from "connected-react-router";
import { createRequest } from "../../api/requests";
import { TimeoutError } from "promise-timeout";

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

	handleFormSubmit = async (values, formActions) => {
		const { isAssetBlocked, push } = this.props;
		try {
			const isBlocked = await isAssetBlocked(values.asset_symbol);
			const isEnoughAmount = this.isEnoughAmount(values.amount, values.asset_symbol);

			if (isBlocked) {
				formActions.setFieldError("asset_symbol", "asset is blocked at the moment");
			}
			if (!isEnoughAmount) {
				formActions.setFieldError("amount", "min amount is 1 oUSD");
			}
			if (!isBlocked && isEnoughAmount) {
				const res = await createRequest(values);
				if (!res.error) {
					notification.success({
						message: "Done",
						description: "Deposit request is successfully created",
					});
					push("/active-requests");
				} else if (res.error.data) {
					formActions.setErrors(res.error.data);
				}
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
				<PageTitle>Deposit</PageTitle>
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
															<Option key={index} value={asset}>
																{asset}
															</Option>
														);
													})}
												</Select>
											</Form.Item>
											<Text type="secondary" style={{ display: "block", margin: "-12px 0 12px 0" }}>
												You will be able to send to the agent only chosen fiat currency
											</Text>
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
		isAssetBlocked: Actions.assets.isAssetBlocked,
		getExchangeRates: Actions.assets.getExchangeRates,
		push,
	}
)(Deposit);
