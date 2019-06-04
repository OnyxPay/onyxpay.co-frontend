import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form, Select } from "antd";
import { PageTitle } from "../../components";
// import { country_list } from "../../assets/country_list";
import Actions from "../../redux/actions";
import { getData as getCountriesData } from "country-list";

const { Option } = Select;
class Deposit extends Component {
	componentDidMount() {
		const { getAssetsList } = this.props;
		getAssetsList();
	}

	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		console.log("sending", values);
		resetForm();
	};

	handleAssetChange = setFieldValue => (value, option) => {
		console.log("handleAssetChange", value);
		setFieldValue("asset", value);
	};

	handleCountryChange = setFieldValue => (value, option) => {
		console.log("handleCountryChange", value);
		setFieldValue("country", value);
	};

	render() {
		const { assets } = this.props;
		return (
			<>
				<PageTitle>Deposit</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ asset: "oUSD", amount: "", country: "" }}
						// validate={values => {
						// 	let errors = {};
						// 	if (!values.agentId) {
						// 		errors.agentId = "required";
						// 	}
						// 	return errors;
						// }}
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
						}) => {
							return (
								<form onSubmit={handleSubmit}>
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

									<Form.Item label="Amount" required>
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

									<Button type="primary" htmlType="submit" disabled={isSubmitting}>
										Submit
									</Button>
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
		};
	},
	{ getAssetsList: Actions.assets.getAssetsList }
)(Deposit);
