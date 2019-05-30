import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Typography, Form, Input, Button } from "antd";
import Actions from "../../../redux/actions";
// eslint-disable-next-line no-unused-vars
import { tempWalletPassword } from "../../../api/constants";
import { decryptWallet } from "../../../api/wallet";

const { Title } = Typography;

class UnlockWalletModal extends Component {
	state = this.initState();

	initState() {
		return {
			pk: "",
			mnemonics: "",
			wallet: "",
		};
	}

	handleUnlockWallet = async ({ password }, formActions) => {
		const { wallet, setUnlockWallet, hideModal } = this.props;
		try {
			await decryptWallet(wallet, password);
			tempWalletPassword.password = password;
			setUnlockWallet();
			hideModal();
		} catch (error) {
			if (error === 53000) {
				formActions.setFieldError("password", "account's password is not correct");
			}
		} finally {
			formActions.setSubmitting(false);
		}
	};

	render() {
		const { isModalVisible, hideModal } = this.props;

		return (
			<Modal
				title=""
				visible={isModalVisible}
				onCancel={hideModal}
				footer={null}
				className="wallet-unlock-modal"
				destroyOnClose={true}
				zIndex={9999}
			>
				<div>
					<Title level={3} style={{ textAlign: "center" }}>
						Unlock Your wallet
					</Title>
					<Formik
						onSubmit={this.handleUnlockWallet}
						initialValues={{ password: "" }}
						validate={({ password }) => {
							let errors = {};
							if (!password) {
								errors.password = "required";
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
							...rest
						}) => {
							return (
								<form onSubmit={handleSubmit}>
									<Form.Item
										label="Password"
										className="ant-form-item--lh32"
										validateStatus={errors.password && touched.password ? "error" : ""}
										help={errors.password && touched.password ? errors.password : ""}
									>
										<Input.Password
											name="password"
											value={values.password}
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
											Unlock
										</Button>
									</div>
								</form>
							);
						}}
					</Formik>
				</div>
			</Modal>
		);
	}
}

export default connect(
	state => {
		return {
			isModalVisible: state.walletUnlock.isModalVisible,
			wallet: state.wallet,
		};
	},
	{
		hideModal: Actions.walletUnlock.hideWalletUnlockModal,
		setUnlockWallet: Actions.walletUnlock.setUnlockWallet,
	}
)(UnlockWalletModal);
