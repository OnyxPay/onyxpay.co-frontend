import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form, Typography } from "antd";
import { setAmount } from "../../../redux/admin-panel/investments";
import { createSecret } from "./../../../utils/secretHash";
import { TextAligner } from "./../../../components/styled";
const { Title } = Typography;

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
					<Title level={4}>Set Amount</Title>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							user_password: "",
							user_confirm_password: "",
							user_name: "",
							amount: "",
						}}
						validate={({ user_name, user_password, user_confirm_password, amount }) => {
							let errors = {};
							if (!user_name) {
								errors.user_name = "required";
							}
							if (!amount) {
								errors.amount = "required";
							}
							if (!user_password) {
								errors.user_password = "required";
							}
							if (!user_confirm_password) {
								errors.user_confirm_password = "required";
							}
							if (
								user_password &&
								user_confirm_password &&
								user_password !== user_confirm_password
							) {
								errors.user_confirm_password = "Password does not match";
							}

							return errors;
						}}
					>
						{({
							values,
							isSubmitting,
							handleChange,
							handleBlur,
							handleSubmit,
							errors,
							touched,
						}) => {
							return (
								<form onSubmit={handleSubmit} className="ant-form-w50">
									<Form.Item
										label="Login"
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

									<Form.Item
										label="Amount"
										required
										validateStatus={errors.amount && touched.amount ? "error" : ""}
										help={errors.amount && touched.amount ? errors.amount : ""}
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

									<Form.Item
										label="Password"
										required
										validateStatus={errors.user_password && touched.user_password ? "error" : ""}
										help={errors.user_password && touched.user_password ? errors.user_password : ""}
										style={{ marginBottom: 12 }}
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

									<Form.Item
										label="Confirm password"
										required
										validateStatus={
											errors.user_confirm_password && touched.user_confirm_password ? "error" : ""
										}
										help={
											errors.user_confirm_password && touched.user_confirm_password
												? errors.user_confirm_password
												: ""
										}
									>
										<Input.Password
											name="user_confirm_password"
											placeholder="enter confirm password"
											size="large"
											disabled={isSubmitting}
											value={values.user_confirm_password}
											onChange={handleChange}
											onBlur={handleBlur}
										/>
									</Form.Item>
									<TextAligner align="right">
										<Button
											type="primary"
											htmlType="submit"
											disabled={isSubmitting}
											loading={isSubmitting}
										>
											Set amount
										</Button>
									</TextAligner>
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
