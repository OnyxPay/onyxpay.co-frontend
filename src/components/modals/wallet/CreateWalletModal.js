import React, { Component } from "react";
import { connect } from "react-redux";
import { saveAs } from "file-saver";
import { Formik } from "formik";
import { Modal, Typography, Form, Input, Button, Icon, Checkbox } from "antd";
import {
	FormButtons,
	FormButtonsGroup,
	PrivateText,
	MnemonicsText,
	PkText,
	Label,
	BackupTitle,
	WalletCreatedContainer,
	WalletCreatedText,
} from "./styled";
import { isMnemonicsValid, samePassword } from "../../../utils/validate";
import Actions from "../../../redux/actions";
import { wait } from "../../../utils";
import { createWalletAccount } from "../../../api/wallet";

const { Text, Title } = Typography;

const Nav = ({ changeView, direction, resetWalletState, submitForm, isSubmitting }) => {
	return (
		<FormButtonsGroup>
			<Button
				type="link"
				style={{ paddingLeft: 0 }}
				onClick={changeView(direction.back, resetWalletState)}
			>
				<Icon type="arrow-left" /> Go back
			</Button>
			{submitForm ? (
				<Button type="primary" htmlType="submit" disabled={isSubmitting} loading={isSubmitting}>
					Continue
					<Icon type="arrow-right" />
				</Button>
			) : (
				<Button type="primary" onClick={changeView(direction.forward)}>
					Continue
					<Icon type="arrow-right" />
				</Button>
			)}
		</FormButtonsGroup>
	);
};

class CreateWalletModal extends Component {
	state = this.initState();

	initState() {
		return {
			viewIndex: 0,
			pk: "",
			mnemonics: "",
			wallet: "",
		};
	}

	handleCreateWallet = async ({ password }, formActions) => {
		try {
			const { mnemonics, wif, wallet } = await createWalletAccount(password);
			this.handleExport(wallet);
			this.setState({ pk: wif, mnemonics, wallet });
			await wait(500);
			this.handleNav(1)();
		} catch (error) {
			console.log(error);
		} finally {
			formActions.setSubmitting(false);
		}
	};

	finishWalletCreation = ({ mnemonics }, formActions) => {
		const { wallet, mnemonics: generatedMnemonics } = this.state;
		const { setWallet } = this.props;

		if (generatedMnemonics !== mnemonics) {
			formActions.setFieldError("mnemonics", "mnemonics don't match");
		} else {
			// save wallet
			setWallet(wallet);
			this.handleNav(3, true)();
		}
		formActions.setSubmitting(false);
	};

	handleExport = wallet => {
		const blob = new Blob([wallet], {
			type: "text/plain;charset=utf-8",
		});

		const name = "onyx_pay_wallet.dat";
		saveAs(blob, name);
	};

	handleNav = (index, resetWalletState) => () => {
		if (resetWalletState) {
			this.setState({ ...this.initState(), viewIndex: index });
		} else {
			this.setState({ viewIndex: index });
		}
	};

	handleCloseModal = () => {
		const { hideModal } = this.props;
		hideModal();
		this.setState({ ...this.initState() });
	};

	render() {
		const { isModalVisible, switchModal } = this.props;
		const { viewIndex, mnemonics, pk } = this.state;

		return (
			<Modal
				title=""
				visible={isModalVisible}
				onCancel={this.handleCloseModal}
				footer={null}
				className="create-wallet-modal"
				destroyOnClose
			>
				<div>
					{viewIndex === 0 && (
						<div>
							<Title level={3} style={{ textAlign: "center" }}>
								Create New Wallet
							</Title>
							<Formik
								onSubmit={this.handleCreateWallet}
								initialValues={{ password: "", password_confirm: "", terms_confirm: false }}
								validate={({ password, password_confirm, terms_confirm }) => {
									let errors = {};
									if (!password) {
										errors.password = "required";
									} else if (!password_confirm) {
										errors.password_confirm = "required";
									} else {
										errors = samePassword({ password, password_confirm });
									}
									if (!terms_confirm) {
										errors.terms_confirm = "You should accept these terms to continue!";
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
											<Form.Item
												label="Confirm password"
												className="ant-form-item--lh32"
												validateStatus={
													errors.password_confirm && touched.password_confirm ? "error" : ""
												}
												help={
													errors.password_confirm && touched.password_confirm
														? errors.password_confirm
														: ""
												}
											>
												<Input.Password
													name="password_confirm"
													value={values.password_confirm}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
												/>
											</Form.Item>
											<Form.Item
												validateStatus={
													errors.terms_confirm && touched.terms_confirm ? "error" : ""
												}
												help={
													errors.terms_confirm && touched.terms_confirm ? errors.terms_confirm : ""
												}
											>
												<Checkbox
													name="terms_confirm"
													checked={values.terms_confirm}
													onChange={handleChange}
													disabled={isSubmitting}
													style={{ lineHeight: 1.5 }}
												>
													<Text type="secondary">
														I understand that OnyxPay cannot recover or reset my password or the
														wallet file. I will make a backup of the wallet file/password, keep them
														secret and complete all wallet creation steps.
													</Text>
												</Checkbox>
											</Form.Item>
											<FormButtons
												isSubmitting={isSubmitting}
												type="create"
												switchModal={switchModal}
											/>
										</form>
									);
								}}
							</Formik>
						</div>
					)}

					{viewIndex === 1 && (
						<div>
							<Title level={3} style={{ textAlign: "center" }}>
								Create New Wallet
							</Title>
							<div>
								<BackupTitle>
									<Icon type="edit" /> Write down the text below on paper and keep it somewhere
									secret and safe!
								</BackupTitle>
								<Label>Mnemonics phrase</Label>
								<PrivateText mb="24px">
									<MnemonicsText>{mnemonics}</MnemonicsText>
								</PrivateText>
								<Label>Private key (WIF format)</Label>
								<PrivateText mb="24px">
									<PkText>{pk}</PkText>
								</PrivateText>
								<Nav
									changeView={this.handleNav}
									direction={{ back: 0, forward: 2 }}
									resetWalletState={true}
								/>
							</div>
						</div>
					)}

					{viewIndex === 2 && (
						<div>
							<Title level={3} style={{ textAlign: "center" }}>
								Create New Wallet
							</Title>
							<Formik
								onSubmit={this.finishWalletCreation}
								initialValues={{ mnemonics: "" }}
								validate={({ mnemonics }) => {
									let errors = {};
									if (!mnemonics) {
										errors.mnemonics = "required";
									} else if (!isMnemonicsValid(mnemonics)) {
										errors.mnemonics = "mnemonics phrase is not valid";
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
												label="Please, enter Mnemonics phrase"
												validateStatus={errors.mnemonics && touched.mnemonics ? "error" : ""}
												help={errors.mnemonics && touched.mnemonics ? errors.mnemonics : ""}
											>
												<Input.TextArea
													name="mnemonics"
													value={values.mnemonics}
													onChange={handleChange}
													onBlur={handleBlur}
													disabled={isSubmitting}
													rows={3}
													style={{ resize: "none" }}
												/>
											</Form.Item>

											<Nav
												changeView={this.handleNav}
												direction={{ back: 1 }}
												submitForm
												isSubmitting={isSubmitting}
											/>
										</form>
									);
								}}
							</Formik>
						</div>
					)}

					{viewIndex === 3 && (
						<>
							<WalletCreatedContainer>
								<Icon
									type="check-circle"
									theme="twoTone"
									twoToneColor="#52c41a"
									style={{ fontSize: 70 }}
								/>
								<WalletCreatedText>
									You have successfully created the wallet, also it was already imported for you
								</WalletCreatedText>
							</WalletCreatedContainer>
						</>
					)}
				</div>
			</Modal>
		);
	}
}

export default connect(
	null,
	{ setWallet: Actions.wallet.setWallet }
)(CreateWalletModal);
