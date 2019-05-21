import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form } from "antd";
//modules
import { setAmount } from "./../../../modules/Investments";

//utils
import { createSecret } from "./../../../utils/secretHash";

//styles

class SetAmount extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		debugger;
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
											//style={style.input}
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
											//style={style.input}
										/>
									</Form.Item>
									<Form.Item>
										<Input
											id="amount"
											placeholder="enter amount"
											type="number"
											size="large"
											disabled={isSubmitting}
											value={values.amount}
											onChange={handleChange}
											onBlur={handleBlur}
											//style={style.input}
										/>
									</Form.Item>
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
