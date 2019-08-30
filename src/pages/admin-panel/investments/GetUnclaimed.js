import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form, Typography } from "antd";
import { getUnclaimed } from "../../../redux/admin-panel/investment";
import { createSecret } from "../../../utils/secretHash";
import { TextAligner } from "./../../../components/styled";

const { Title } = Typography;

class GetUnclaimed extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		const { getUnclaimed } = this.props;
		const { user_name } = values;
		const { user_password } = values;
		const secret_hash = createSecret(user_name, user_password, true);
		getUnclaimed(secret_hash, { setSubmitting, resetForm });
	};

	render() {
		return (
			<div>
				<Card>
					<Title level={4}>Get Unclaimed</Title>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ user_password: "", user_name: "" }}
						validate={values => {
							let errors = {};
							if (!values.user_name) {
								errors.user_name = "Required";
							}
							if (!values.user_password) {
								errors.user_password = "Required";
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
										label="Password hash"
										required
										validateStatus={errors.user_password && touched.user_password ? "error" : ""}
										help={errors.user_password && touched.user_password ? errors.user_password : ""}
									>
										<Input.Password
											name="user_password"
											placeholder="enter password hash"
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
											Get unclaimed
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
	{ getUnclaimed }
)(GetUnclaimed);
