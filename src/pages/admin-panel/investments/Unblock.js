import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form, Row, Col } from "antd";
import { Unblock } from "../../../redux/admin-panel/Investments";
import { createSecret } from "./../../../utils/secretHash";

class UnblockInvestor extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		const { Unblock } = this.props;
		const { user_name } = values;
		const { user_password } = values;
		const secret_hash = createSecret(user_name, user_password, true);
		Unblock(secret_hash, { setSubmitting, resetForm });
	};

	render() {
		return (
			<div>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ user_password: "", user_name: "" }}
						validate={values => {
							let errors = {};
							if (!values.user_name) {
								errors.user_name = "required";
							}
							if (!values.user_password) {
								errors.user_password = "required";
							}
							return errors;
						}}
					>
						{props => {
							const {
								values,
								isSubmitting,
								handleChange,
								handleBlur,
								handleSubmit,
								errors,
								touched,
							} = props;
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={16}>
										<Col lg={12} md={24}>
											<Form.Item
												required
												validateStatus={errors.user_name && touched.user_name ? "error" : ""}
												help={errors.user_name && touched.user_name ? errors.user_name : ""}
											>
												<Input
													name="user_name"
													placeholder="enter name"
													disabled={isSubmitting}
													size="large"
													value={values.user_name}
													onChange={handleChange}
													onBlur={handleBlur}
												/>
											</Form.Item>
										</Col>
										<Col lg={12} md={24}>
											<Form.Item
												required
												validateStatus={
													errors.user_password && touched.user_password ? "error" : ""
												}
												help={
													errors.user_password && touched.user_password ? errors.user_password : ""
												}
											>
												<Input.Password
													name="user_password"
													placeholder="enter password"
													size="large"
													disabled={isSubmitting}
													value={values.user_password}
													onChange={handleChange}
													onBlur={handleBlur}
												/>
											</Form.Item>
										</Col>
									</Row>
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
										Unblock investor
									</Button>
								</form>
							);
						}}
					</Formik>
				</Card>
			</div>
		);
	}
}

export default connect(
	null,
	{ Unblock }
)(UnblockInvestor);
