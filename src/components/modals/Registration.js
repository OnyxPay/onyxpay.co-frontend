import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Button, Form, Input, Select } from "antd";
import { country_list } from "../../assets/country_list";
import Actions from "../../redux/actions";
import { unlockWalletAccount } from "../../api/wallet";

const { Option } = Select;

const initialValues = {
	first_name: "",
	last_name: "",
	country_id: "",
	referral_code: "",
};

class RegistrationModal extends Component {
	handleFormSubmit = async (values, formActions) => {
		const { signUp } = this.props;
		try {
			const unlocked = await unlockWalletAccount();
			console.log(unlocked);
			const response = await signUp(values);
			if (response && response.error) {
				formActions.setErrors(response.data);
			}
			console.log("RegistrationModal$$$", response);
			// sign magic with pk
			// make api request
			formActions.setSubmitting(false);
			// formActions.resetForm();
		} catch (error) {
			console.log(error);
			formActions.setSubmitting(false);
		} finally {
		}
	};

	handleSelectChange = setFieldValue => (value, option) => {
		setFieldValue("country_id", value);
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
						if (!values.first_name) {
							errors.first_name = "required";
						}
						if (!values.last_name) {
							errors.last_name = "required";
						}
						if (!values.country_id) {
							errors.country_id = "required";
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
									validateStatus={errors.first_name && touched.first_name ? "error" : ""}
									help={errors.first_name && touched.first_name ? errors.first_name : ""}
								>
									<Input
										name="first_name"
										placeholder="Enter your first name"
										value={values.first_name}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Last name"
									required
									validateStatus={errors.last_name && touched.last_name ? "error" : ""}
									help={errors.last_name && touched.last_name ? errors.last_name : ""}
								>
									<Input
										name="last_name"
										placeholder="Enter your last name"
										value={values.last_name}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Country"
									required
									validateStatus={errors.country_id && touched.country_id ? "error" : ""}
									help={errors.country_id && touched.country_id ? errors.country_id : ""}
								>
									<Select
										showSearch
										name="country_id"
										placeholder="Select a country"
										optionFilterProp="children"
										value={values.country_id}
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
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
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

export default connect(
	null,
	{ unlockWallet: Actions.walletUnlock.showWalletUnlockModal, signUp: Actions.auth.signUp }
)(RegistrationModal);
