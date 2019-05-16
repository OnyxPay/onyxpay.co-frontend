import React, { Component } from "react";
import { Formik } from "formik";
import { Modal, Button, Form, Input } from "antd";

class ConfirmEmailModal extends Component {
	handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
		console.log("sending", values);
	};

	handleSelectChange = setFieldValue => (value, option) => {
		setFieldValue("country", value);
	};

	render() {
		const { isModalVisible, hideModal } = this.props;
		return (
			<Modal
				title=""
				visible={isModalVisible}
				footer={null}
				closable={false}
				destroyOnClose={true}
				className="confirm-email-modal"
			>
				<h1>You are almost there!</h1>
				<p>
					Your account has successfully been created, to finish the registration process you need to
					confirm your email and phone number via Telegram
				</p>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={{ email: "" }}
					validate={values => {
						let errors = {};
						if (!values.email) {
							errors.email = "required";
						}
						return errors;
					}}
				>
					{({
						values,
						errors,
						touched,
						isSubmitting,
						handleChange,
						handleBlur,
						handleSubmit,
						setFieldValue,
						...rest
					}) => {
						return (
							<form onSubmit={handleSubmit}>
								<Form.Item
									validateStatus={errors.email && touched.email ? "error" : ""}
									help={errors.email && touched.email ? errors.email : ""}
								>
									<Input
										placeholder="Please, enter your email address"
										name="referralCode"
										type="email"
										value={values.referralCode}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<div className="ant-modal-custom-footer">
									<Button key="back" onClick={hideModal} style={{ marginRight: 10 }}>
										Logout
									</Button>
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
										Confirm Email
									</Button>
								</div>
							</form>
						);
					}}
				</Formik>
			</Modal>
		);
	}
}

export default ConfirmEmailModal;
