import React, { Component } from "react";
import { connect } from "react-redux";
import { getData as getCountriesData } from "country-list";
import {
	Card,
	Button,
	Input,
	Form,
	Select,
	message,
	Typography,
	notification,
	Row,
	Col,
} from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { push } from "connected-react-router";
import { createDepositRequest } from "../../api/deposit";

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
				const res = await createDepositRequest(values);
				if (!res.error) {
					console.log("DONE", res);
					notification.success({
						message: "Done",
						description: "Deposit request is successfully created",
					});
					push("/active-requests");
				} else if (res.error.data) {
					formActions.setErrors(res.error.data);
				}
			}
		} catch (error) {
			message.error(error.message);
		}

		formActions.setSubmitting(false);
	};

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
	};

	handleCountryChange = setFieldValue => (value, option) => {
		setFieldValue("country_symbol", value);
	};

	render() {
		const { assets, user } = this.props;

		return (
			<>
				<PageTitle>Deposit</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ asset_symbol: "oUSD", amount: "", country_symbol: user.countryId }}
						validate={values => {
							let errors = {};
							if (!values.asset_symbol) {
								errors.asset_symbol = "required";
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
										<Col xl={8} lg={9} md={24}>
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
										<Col xl={8} lg={9} md={24}>
											<Form.Item
												label="Country"
												required
												validateStatus={
													errors.country_symbol && touched.country_symbol ? "error" : ""
												}
												help={
													errors.country_symbol && touched.country_symbol
														? errors.country_symbol
														: ""
												}
											>
												<Select
													showSearch
													name="country_symbol"
													placeholder="Select a country"
													optionFilterProp="children"
													value={values.country_symbol}
													onChange={this.handleCountryChange(setFieldValue)}
													filterOption={(input, option) =>
														option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
													}
													disabled={isSubmitting}
												>
													{getCountriesData().map((country, index) => {
														return (
															<Option key={country.code} value={country.code}>
																{country.name}
															</Option>
														);
													})}
												</Select>
											</Form.Item>
										</Col>

										<Col xl={8} lg={6} md={24}>
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
										<Button type="primary" htmlType="submit" disabled={isSubmitting}>
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
