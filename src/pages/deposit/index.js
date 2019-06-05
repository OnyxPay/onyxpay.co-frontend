import React, { Component } from "react";
import { connect } from "react-redux";
import { getData as getCountriesData } from "country-list";
import { Card, Button, Input, Form, Select, message, Typography } from "antd";
import { Formik } from "formik";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";

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
		if (rateUSD.sell > rate.sell * amount) {
			return false;
		}
		return true;
	}

	handleFormSubmit = async (values, formActions) => {
		const { isAssetBlocked } = this.props;
		console.log(values);
		try {
			const isBlocked = await isAssetBlocked(values.asset);
			if (isBlocked) {
				formActions.setFieldError("asset", "asset is blocked");
			}
		} catch (error) {
			message.error(error.message);
		}

		if (!this.isEnoughAmount(values.amount, values.asset)) {
			formActions.setFieldError("amount", "minimum amount 1 oUSD");
		}
		formActions.setSubmitting(false);
	};

	handleAssetChange = setFieldValue => async (value, option) => {
		console.log("handleAssetChange", value);
		setFieldValue("asset", value);
	};

	handleCountryChange = setFieldValue => (value, option) => {
		console.log("handleCountryChange", value);
		setFieldValue("country", value);
	};

	render() {
		const { assets, user } = this.props;

		return (
			<>
				<PageTitle>Deposit</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ asset: "oUSD", amount: "", country: user.countryId }}
						validate={values => {
							let errors = {};
							if (!values.asset) {
								errors.asset = "required";
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
								<form onSubmit={handleSubmit} className="ant-form-w50">
									<Form.Item
										label="Asset"
										required
										validateStatus={errors.asset && touched.asset ? "error" : ""}
										help={errors.asset && touched.asset ? errors.asset : ""}
									>
										<Select
											size="large"
											showSearch
											name="asset"
											placeholder="Select an asset"
											optionFilterProp="children"
											value={values.asset}
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
									<Text type="secondary" style={{ display: "block", marginTop: "-12px" }}>
										You will be able to send to the agent only chosen fiat currency
									</Text>

									<Form.Item
										label="Country"
										required
										validateStatus={errors.country && touched.country ? "error" : ""}
										help={errors.country && touched.country ? errors.country : ""}
									>
										<Select
											size="large"
											showSearch
											name="country"
											placeholder="Select a country"
											optionFilterProp="children"
											value={values.country}
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

									<Form.Item
										label="Amount"
										required
										validateStatus={errors.amount && touched.amount ? "error" : ""}
										help={errors.amount && touched.amount ? errors.amount : ""}
									>
										<Input
											size="large"
											name="amount"
											type="number"
											placeholder="Enter an amount"
											value={values.amount}
											onChange={handleChange}
											onBlur={handleBlur}
											disabled={isSubmitting}
										/>
									</Form.Item>
									<TextAligner align="right">
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
	}
)(Deposit);
