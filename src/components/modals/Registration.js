import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Formik } from "formik";
import { Modal, Button, Form, Input, Select, message } from "antd";
import Actions from "../../redux/actions";
import { unlockWalletAccount } from "../../api/wallet";
import { ErrorText } from "../styled";
import text from "../../assets/text.json";
import { signWithPk } from "../../utils/blockchain";
import { generateTokenTimeStamp } from "../../utils";
import { getData as getCountriesData } from "country-list";
import { isLatinChars, isBase58Address } from "../../utils/validate";
import { addReferral } from "api/referral";

const { Option } = Select;

function areBcErrors(data) {
	const keysToCheck = ["public_key", "wallet_addr"];
	return keysToCheck.some(key => data.hasOwnProperty(key));
}

class RegistrationModal extends Component {
	state = this.getInitialState();

	getInitialState() {
		return {
			isBcValidationError: false,
		};
	}

	getInitialFormValues = () => {
		return {
			first_name: "",
			last_name: "",
			country_id: "",
			referral_wallet: localStorage.getItem("rcode") || "",
		};
	};

	handleFormSubmit = async (values, formActions) => {
		const { signUp, push, getUserData } = this.props;
		try {
			const { pk, publicKey, accountAddress } = await unlockWalletAccount();
			const tokenTimestamp = generateTokenTimeStamp();
			const signature = signWithPk(tokenTimestamp, pk);
			values.public_key = publicKey.key;
			values.wallet_addr = accountAddress.toBase58();
			values.signed_msg = signature.serializeHex();

			const res = await signUp(values);

			if (res && res.error) {
				if (res.error.data) {
					formActions.setErrors(res.error.data);
					if (areBcErrors(res.error.data)) {
						this.setState({ isBcValidationError: true });
					}
				}
			} else {
				await getUserData();
				if (values.referral_wallet) {
					await addReferral(values.referral_wallet, pk, accountAddress);
				}
				message.success(text.modals.registration.reg_success, 5);
				formActions.resetForm();
				push("/");
			}
			formActions.setSubmitting(false);
		} catch (error) {
			console.log(error);
			formActions.setSubmitting(false);
		}
	};

	handleSelectChange = setFieldValue => (value, option) => {
		setFieldValue("country_id", value);
	};

	handleHideModal = () => {
		const { hideModal } = this.props;
		hideModal();
		this.setState(this.getInitialState());
	};

	render() {
		const { isModalVisible } = this.props;
		const { isBcValidationError } = this.state;
		const initialReferralWalletValue = localStorage.getItem("rcode") || "";

		return (
			<Modal
				title="Create Client account"
				visible={isModalVisible}
				onCancel={this.handleHideModal}
				footer={null}
				className="registration-modal"
				destroyOnClose={true}
				maskClosable={false}
			>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={this.getInitialFormValues()}
					validate={values => {
						let errors = {};
						if (!values.first_name) {
							errors.first_name = "required";
						} else if (values.first_name.length < 2) {
							errors.first_name = "min length 2";
						} else if (!isLatinChars(values.first_name)) {
							errors.first_name = "First name must contain only Latin letters";
						}
						if (!values.last_name) {
							errors.last_name = "required";
						} else if (values.last_name.length < 2) {
							errors.last_name = "min length 2";
						} else if (!isLatinChars(values.last_name)) {
							errors.last_name = "Last name must contain only Latin letters";
						}
						if (!values.country_id) {
							errors.country_id = "required";
						}
						if (values.referral_wallet.length !== 0 && !isBase58Address(values.referral_wallet)) {
							errors.referral_wallet = "Referral wallet address should be in base58 format";
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
										value={values.country_id ? values.country_id : undefined}
										onChange={this.handleSelectChange(setFieldValue)}
										filterOption={(input, option) =>
											option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										}
										disabled={isSubmitting}
									>
										{getCountriesData().map((country, index) => {
											return (
												<Option key={country.code} value={country.code}>
													{country.name}
												</Option>
											);
										})}
									</Select>
								</Form.Item>

								<Form.Item
									label="Referral code"
									validateStatus={errors.referral_wallet && touched.referral_wallet ? "error" : ""}
									help={
										errors.referral_wallet && touched.referral_wallet ? errors.referral_wallet : ""
									}
								>
									<Input
										name="referral_wallet"
										placeholder="Enter referral code"
										value={values.referral_wallet}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting || initialReferralWalletValue !== ""}
									/>
								</Form.Item>

								{isBcValidationError && <ErrorText>{text.modals.registration.bc_error}</ErrorText>}

								<div className="ant-modal-custom-footer">
									<Button key="back" onClick={this.handleHideModal} style={{ marginRight: 10 }}>
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
	{
		unlockWallet: Actions.walletUnlock.showWalletUnlockModal,
		getUserData: Actions.user.getUserData,
		signUp: Actions.auth.signUp,
		push,
	}
)(RegistrationModal);
