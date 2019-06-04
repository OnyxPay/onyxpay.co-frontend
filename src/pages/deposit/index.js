import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Row, Col, Form, Select } from "antd";
import { PageTitle } from "../../components";
import { country_list } from "../../assets/country_list";
import Actions from "../../redux/actions";

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

	handleSelectChange = setFieldValue => (value, option) => {
		setFieldValue("country_id", value);
	};

	render() {
		return (
			<>
				<PageTitle>Deposit</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ asset: "", amount: "", country: "" }}
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
									<Row gutter={16}>
										<Col md={24} lg={12}>
											<Form.Item
												label="Country"
												required
												validateStatus={errors.country_id && touched.country_id ? "error" : ""}
												help={errors.country_id && touched.country_id ? errors.country_id : ""}
											>
												<Select
													size="large"
													showSearch
													name="country_id"
													placeholder="Select a country"
													optionFilterProp="children"
													value={values.country_id}
													onChange={this.handleSelectChange(setFieldValue)}
													filterOption={(input, option) =>
														option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
													}
													disabled={isSubmitting}
												>
													{country_list.map((country, index) => {
														return (
															<Option key={index} value={index}>
																{country}
															</Option>
														);
													})}
												</Select>
											</Form.Item>
										</Col>
										<Col md={24} lg={12}>
											<Form.Item label="Amount" required>
												<Input
													size="large"
													name="amount"
													type="number"
													placeholder="enter amount"
													value={values.amount}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
										</Col>
									</Row>

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
		};
	},
	{ getAssetsList: Actions.assets.getAssetsList }
)(Deposit);
