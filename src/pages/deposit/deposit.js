import React, { Component } from "react";
import { Card, Button, Input, Row, Col, Form } from "antd";
import { PageTitle } from "../../components";
import { Formik } from "formik";

class Deposit extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		console.log("sending", values);
		resetForm();
	};

	render() {
		return (
			<>
				<PageTitle>Deposit</PageTitle>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ agentId: "", amount: "" }}
						validate={values => {
							let errors = {};
							if (!values.agentId) {
								errors.agentId = "required";
							}
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
						}) => {
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={16}>
										<Col md={24} lg={12}>
											<Form.Item
												validateStatus={errors.agentId ? "error" : ""}
												help={errors.agentId ? errors.agentId : ""}
												required
											>
												<Input
													size="large"
													name="agentId"
													placeholder="enter agent account number"
													value={values.agentId}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
										</Col>
										<Col md={24} lg={12}>
											<Form.Item>
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

export default Deposit;
