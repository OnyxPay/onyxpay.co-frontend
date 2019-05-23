import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form } from "antd";
import { Block } from "../../../redux/admin-panel/Investments";
import { createSecret } from "./../../../utils/secretHash";

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
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ user_password: "", user_name: "" }}
					>
						{props => {
							const { values, isSubmitting, handleChange, handleBlur, handleSubmit } = props;
							return (
								<form onSubmit={handleSubmit}>
									<Form.Item>
										<Input
											id="user_name"
											placeholder="enter name"
											disabled={isSubmitting}
											size="large"
											value={values.user_name}
											onChange={handleChange}
											onBlur={handleBlur}
										/>
									</Form.Item>
									<Form.Item>
										<Input
											id="user_password"
											placeholder="enter password"
											size="large"
											disabled={isSubmitting}
											value={values.user_password}
											onChange={handleChange}
											onBlur={handleBlur}
										/>
									</Form.Item>
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
										Block investor
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
	{ Block }
)(BlockInvestor);
