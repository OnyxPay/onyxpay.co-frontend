import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Typography, Form, Input, Button } from "antd";
import { FormButtons } from "./styled";
import Actions from "../../../redux/actions";

const { Title } = Typography;

class CreateWalletModal extends Component {
	state = this.initState();

	initState() {
		return {
			pk: "",
			mnemonics: "",
			wallet: "",
		};
	}

	handleUnlockWallet = async ({ password }, formActions) => {
		try {
			console.log("password", password);
		} catch (error) {
			console.log(error);
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
										<Button type="primary" htmlType="submit" disabled={isSubmitting}>
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
		};
	},
	{ hideModal: Actions.walletUnlock.hideWalletUnlockModal }
)(CreateWalletModal);
