import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form, Row, Col } from "antd";
import { setAmount } from "../../../redux/admin-panel/Investments";
import { createSecret } from "./../../../utils/secretHash";

class SetAmount extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		const { setAmount } = this.props;
		const { user_name } = values;
		const { user_password } = values;
		const { amount } = values;
		const secret_hash = createSecret(user_name, user_password, true);
		setAmount(secret_hash, amount, { setSubmitting, resetForm });
	};

	render() {
		return (
			<div>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ user_password: "", user_name: "", amount: "" }}
						validate={values => {
							let errors = {};
							if (!values.user_name) {
								errors.user_name = "required";
							} else if (!values.user_password) {
								errors.user_password = "required";
							} else if (!values.amount) {
								errors.amount = "required";
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
							} = props;
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={16}>
										<Col md={24} lg={10}>
											<Form.Item
												validateStatus={errors.user_name ? "error" : ""}
												help={errors.user_name ? errors.user_name : ""}
												required
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
										<Col md={24} lg={10}>
											<Form.Item
												validateStatus={errors.user_password ? "error" : ""}
												help={errors.user_name ? errors.user_password : ""}
												required
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
										<Col md={24} lg={4}>
											<Form.Item
												validateStatus={errors.amount ? "error" : ""}
												help={errors.user_name ? errors.amount : ""}
												required
											>
												<Input
													name="amount"
													placeholder="enter amount"
													type="number"
													size="large"
													disabled={isSubmitting}
													value={values.amount}
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
										Set amount
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
	{ setAmount }
)(SetAmount);
