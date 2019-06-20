import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form, Typography } from "antd";
import { Block } from "../../../redux/admin-panel/investment";
import { createSecret } from "./../../../utils/secretHash";
import { TextAligner } from "./../../../components/styled";
const { Title } = Typography;
class BlockInvestor extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		const { Block } = this.props;
		const { user_name } = values;
		const { user_password } = values;
		const secret_hash = createSecret(user_name, user_password, true);
		Block(secret_hash, { setSubmitting, resetForm });
	};

	render() {
		return (
			<div>
				<Card>
					<Title level={4}>Block</Title>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ user_password: "", user_name: "" }}
						validate={({ user_name, user_password }) => {
							let errors = {};
							if (!user_name) {
								errors.user_name = "required";
							}
							if (!user_password) {
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
								<form onSubmit={handleSubmit} className="admin-form">
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
										label="Password"
										required
										validateStatus={errors.user_password && touched.user_password ? "error" : ""}
										help={errors.user_password && touched.user_password ? errors.user_password : ""}
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
									<TextAligner align="right">
										<Button
											type="primary"
											htmlType="submit"
											disabled={isSubmitting}
											loading={isSubmitting}
										>
											Block investor
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
	{ Block }
)(BlockInvestor);
