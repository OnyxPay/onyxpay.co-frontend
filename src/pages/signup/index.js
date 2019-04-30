import React, { Component } from "react";
import { PageTitle } from "../../components";
import { Card, Button, Input, Row, Col, Form, Select } from "antd";
import { Formik } from "formik";
import { country_list } from "../../assets/country_list";
const { Option } = Select;

const initialValues = {
	firstName: "",
	lastName: "",
	phone: "",
	email: "",
	country: "",
	referalCode: "",
	password: "",
	passwordConfirm: "",
};

/* 
  https://codesandbox.io/s/4x47oznvvx

*/
class SignUp extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		console.log("sending", values);
		resetForm();
	};

	handleSelectChange = setFieldValue => (value, option) => {
		console.log(value, option);
		setFieldValue("country", value);
	};

	render() {
		return (
			<>
				<PageTitle>Create a customer account</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={initialValues}
						validate={values => {
							let errors = {};
							// if (!values.firstName) {
							// 	errors.firstName = "required";
							// }
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
							...rest
						}) => {
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={16}>
										<Col md={24} lg={12}>
											<Form.Item
												label="First name"
												// required
												// validateStatus={errors.firstName ? "error" : ""}
												// help={errors.firstName ? errors.firstName : ""}
											>
												<Input
													size="large"
													name="firstName"
													placeholder="enter your first name"
													value={values.firstName}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Form.Item label="Last name">
												<Input
													size="large"
													name="lastName"
													value={values.lastName}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Form.Item label="Phone">
												<Input
													size="large"
													name="phone"
													value={values.phone}
													type="phone"
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Form.Item label="Email">
												<Input
													size="large"
													name="email"
													value={values.email}
													type="email"
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
										</Col>

										<Col md={24} lg={12}>
											<Form.Item label="Country" hasFeedback>
												<Select
													showSearch
													name="country"
													size="large"
													placeholder="Select a country"
													optionFilterProp="children"
													value={values.country}
													onChange={this.handleSelectChange(setFieldValue)}
													filterOption={(input, option) =>
														option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
													}
													disabled={isSubmitting}
												>
													{country_list.map(country => {
														return (
															<Option key={country} value={country}>
																{country}
															</Option>
														);
													})}
												</Select>
											</Form.Item>

											<Form.Item label="Referal code">
												<Input
													size="large"
													name="referalCode"
													value={values.referalCode}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Form.Item label="Password">
												<Input
													size="large"
													name="password"
													value={values.password}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>

											<Form.Item label="Confirm password">
												<Input
													size="large"
													name="passwordConfirm"
													value={values.passwordConfirm}
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

export default SignUp;
