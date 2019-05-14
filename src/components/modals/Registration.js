import React, { Component } from "react";
import { Formik } from "formik";
import { Modal, Button, Form, Input, Select } from "antd";
import { country_list } from "../../assets/country_list";

const { Option } = Select;

const initialValues = {
	firstName: "",
	lastName: "",
	country: "",
	referralCode: "",
};

class RegistrationModal extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
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
				onCancel={hideModal}
				footer={null}
				className="registration-modal"
			>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={initialValues}
					validate={values => {
						let errors = {};
						if (!values.firstName) {
							errors.firstName = "required";
						}
						if (!values.lastName) {
							errors.lastName = "required";
						}
						if (!values.country) {
							errors.country = "required";
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
									label="First name"
									required
									validateStatus={errors.firstName && touched.firstName ? "error" : ""}
									help={errors.firstName && touched.firstName ? errors.firstName : ""}
								>
									<Input
										name="firstName"
										placeholder="Enter your first name"
										value={values.firstName}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Last name"
									required
									validateStatus={errors.lastName && touched.lastName ? "error" : ""}
									help={errors.lastName && touched.lastName ? errors.lastName : ""}
								>
									<Input
										name="lastName"
										placeholder="Enter your last name"
										value={values.lastName}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Country"
									required
									validateStatus={errors.country && touched.country ? "error" : ""}
									help={errors.country && touched.country ? errors.country : ""}
								>
									<Select
										showSearch
										name="country"
										placeholder="Select a country"
										optionFilterProp="children"
										value={values.country}
										onChange={this.handleSelectChange(setFieldValue)}
										filterOption={(input, option) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										disabled={isSubmitting}
									>
										{country_list.map(country => {
											return (
												<Option key={country} value={country}>
													{country}
												</Option>
											);
										})}
									</Select>
								</Form.Item>

								<Form.Item label="Referral code">
									<Input
										name="referralCode"
										value={values.referralCode}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<div className="ant-modal-custom-footer">
									<Button key="back" onClick={hideModal} style={{ marginRight: 10 }}>
										Cancel
									</Button>
									<Button type="primary" htmlType="submit" disabled={isSubmitting}>
										Submit
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

export default RegistrationModal;
