import React, { Component } from "react";
import { Card, Button, Input, Row, Col } from "antd";
import { PageTitle } from "../../components";
import { Formik } from "formik";

class Deposit extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		console.log("sending", values);
	};

	render() {
		return (
			<>
				<PageTitle>Deposit</PageTitle>
				<Card>
					{" "}
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ to: "", asset_id: "", amount: "" }}
					>
						{props => {
							const {
								values,
								isSubmitting,
								handleChange,
								handleBlur,
								handleSubmit,
								setFieldValue,
							} = props;
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={16} style={{ marginBottom: "20px" }}>
										<Col md={24} lg={12}>
											<Input
												size="large"
												id="agentAN"
												placeholder="enter agent account number"
												value={values.agentAN}
												onChange={handleChange}
												onBlur={handleBlur}
												disabled={isSubmitting}
											/>
										</Col>
										<Col md={24} lg={12}>
											<Input
												size="large"
												id="amount"
												type="number"
												placeholder="enter amount"
												value={values.amount}
												onChange={handleChange}
												onBlur={handleBlur}
												disabled={isSubmitting}
											/>
										</Col>
									</Row>

									<Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
										Send
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
