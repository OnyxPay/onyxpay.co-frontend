import React, { Component } from "react";
import { Typography, Card, Button, Input, Row, Col, Form } from "antd";
import { PageTitle } from "../../components";
import * as axios from "axios";
import { Formik } from "formik";
import { BackendUrl } from "../../api/constants";

const { Title } = Typography;

class Settlement extends Component {
	state = {
		settlements: [],
	};

	componentDidMount() {
		let formData = new FormData();
		formData.append("first_name", "first_name");
		formData.append("last_name", "last_name");
		formData.append("phone", "phone");
		formData.append("email", "email");
		formData.append("country_id", 380);
		formData.append("password", "password");

		axios.post(`${BackendUrl}/api/v1/sign-up`, formData).then(res => {
			console.log(res);
			console.log(res.data);
		});
	}

	handleFormSubmit = (values, { resetForm }) => {
		console.log("sending", values);
		resetForm();
	};

	render() {
		return (
			<>
				<PageTitle>Settlement Accounts</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							first_name: "",
							last_name: "",
							phone: "",
							email: "",
							country_id: "",
							password: "",
						}}
						validate={values => {
							let errors = {};
							if (!values.first_name) {
								errors.first_name = "required";
							}
							if (!values.last_name) {
								errors.last_name = "required";
							}
							if (!values.email) {
								errors.email = "required";
							}
							if (!values.country_id) {
								errors.country_id = "required";
							}
							if (!values.password) {
								errors.password = "required";
							}
							return errors;
						}}
					>
						{({ values, errors, isSubmitting, handleChange, handleBlur, handleSubmit }) => {
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={10}>
										<Col md={24} lg={12}>
											<Form.Item
												validateStatus={errors.first_name ? "error" : ""}
												help={errors.first_name ? errors.first_name : ""}
												required
											>
												<Input
													size="large"
													name="first_name"
													placeholder="First name"
													value={values.first_name}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
											<Form.Item
												validateStatus={errors.last_name ? "error" : ""}
												help={errors.last_name ? errors.last_name : ""}
												required
											>
												<Input
													size="large"
													name="last_name"
													placeholder="Last name"
													value={values.last_name}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
											<Form.Item>
												<Input
													size="large"
													name="phone"
													type="number"
													placeholder="Phone number"
													value={values.phone}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
											<Form.Item
												validateStatus={errors.email ? "error" : ""}
												help={errors.email ? errors.email : ""}
												required
											>
												<Input
													size="large"
													name="email"
													placeholder="Email"
													value={values.email}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
											<Form.Item
												validateStatus={errors.country_id ? "error" : ""}
												help={errors.country_id ? errors.country_id : ""}
												required
											>
												<Input
													size="large"
													name="country_id"
													placeholder="Country"
													value={values.country_id}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
											<Form.Item
												validateStatus={errors.password ? "error" : ""}
												help={errors.password ? errors.password : ""}
												required
											>
												<Input
													size="large"
													name="password"
													placeholder="Password"
													value={values.password}
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

export default Settlement;
