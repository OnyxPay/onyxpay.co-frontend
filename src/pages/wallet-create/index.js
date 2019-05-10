import React, { Component } from "react";
import { Formik } from "formik";
import { Typography, Form, Input, Checkbox, Button, Icon } from "antd";
import { saveAs } from "file-saver";
import { Wrapper, Card, CardBody, FormButtons, FormButtonsGroup } from "../wallet-unlock/styled";
import { samePassword } from "../../utils/validate";
import { createWalletAccount } from "../../api/wallet";
import styled from "styled-components";
const { Text, Title } = Typography;

const PrivateText = styled.div`
	background: rgb(249, 249, 249);
	border: 1px dashed rgb(216, 216, 216);
	padding: 15px;
	margin-bottom: ${p => (p.mb ? p.mb : "auto")};
`;

const MnemonicsText = styled.div`
	font-size: 18px;
	word-spacing: 6px;
	font-weight: 500;
`;

const PkText = styled.div`
	word-break: break-all;
	font-size: 16px;
	font-weight: 500;
`;

const Label = styled.div`
	margin-bottom: 5px;
`;

const Nav = ({ changeView }) => {
	return (
		<FormButtonsGroup>
			<Button type="link" style={{ paddingLeft: 0 }} onClick={changeView(0)}>
				<Icon type="arrow-left" /> Go back
			</Button>
			<Button type="primary" onClick={changeView(2)}>
				Continue
				<Icon type="arrow-right" />
			</Button>
		</FormButtonsGroup>
	);
};

class WalletCreate extends Component {
	state = {
		viewIndex: 0,
	};

	handleCreateWallet = async ({ password }, { setSubmitting, resetForm }) => {
		try {
			const { mnemonics, wif, wallet } = await createWalletAccount(password);
			// save data into state
			console.log({ mnemonics, wif, wallet });
			this.handleExport(wallet);
			this.handleNav(1)();
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

	handleExport = wallet => {
		const blob = new Blob([wallet], {
			type: "text/plain;charset=utf-8",
		});
		const now = new Date().toLocaleDateString();
		const name = `onyx_pay_wallet_${now}.dat`;
		saveAs(blob, name);
	};

	handleNav = index => () => {
		this.setState({ viewIndex: index });
	};

	render() {
		const { viewIndex } = this.state;

		return (
			<Wrapper>
				<Card>
					<CardBody>
						<Title level={3} style={{ textAlign: "center" }}>
							Create New Wallet
						</Title>

						{viewIndex === 0 && (
							<div>
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
											errors.terms_confirm = "You should accept these terms to continue";
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
													// required
													validateStatus={errors.password && touched.password ? "error" : ""}
													help={errors.password && touched.password ? errors.password : ""}
												>
													<Input
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
													// required
													validateStatus={
														errors.password_confirm && touched.password_confirm ? "error" : ""
													}
													help={
														errors.password_confirm && touched.password_confirm
															? errors.password_confirm
															: ""
													}
												>
													<Input
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
														errors.terms_confirm && touched.terms_confirm
															? errors.terms_confirm
															: ""
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
															wallet file. I will make a backup of the wallet file/password, keep
															them secret and complete all wallet creation steps.
														</Text>
													</Checkbox>
												</Form.Item>
												<FormButtons isSubmitting={isSubmitting} type="create" />
											</form>
										);
									}}
								</Formik>
							</div>
						)}

						{viewIndex === 1 && (
							<div>
								<Label>Mnemonics phrase</Label>
								<PrivateText mb="24px">
									<MnemonicsText>
										flame brown anger fresh original slim merit aim skill issue long citizen tattoo
										hollow sphere frown sentence mammal job exist assault trim legend gorilla
									</MnemonicsText>
								</PrivateText>
								<Label>Private key (WIF format)</Label>
								<PrivateText mb="24px">
									<PkText>L1G8L7ux8VBepd9u6hPMhqcJfsnmrcG3koqadiNu4v7yPQEfmE1b</PkText>
								</PrivateText>
								<Nav changeView={this.handleNav} />
							</div>
						)}
					</CardBody>
				</Card>
			</Wrapper>
		);
	}
}

export default WalletCreate;
