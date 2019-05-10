import React, { Component } from "react";
import { Formik } from "formik";
import { Typography, Form, Input, Checkbox } from "antd";
import { Wrapper, Card, CardBody, FormButtons } from "../wallet-unlock/styled";
import { samePassword } from "../../utils/validate";
import { createWalletAccount } from "../../api/wallet";

const { Text, Title } = Typography;

class WalletCreate extends Component {
	state = {};

	handleCreateWallet = async ({ password }, { setSubmitting, resetForm }) => {
		try {
			const { mnemonics, wif, wallet } = await createWalletAccount(password);
			console.log({ mnemonics, wif, wallet });
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};
	render() {
		return (
			<Wrapper>
				<Card>
					<CardBody>
						<Title level={3} style={{ textAlign: "center" }}>
							Create New Wallet
						</Title>
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
											<FormButtons isSubmitting={isSubmitting} type="create" />
										</form>
									);
								}}
							</Formik>
						</div>
					</CardBody>
				</Card>
			</Wrapper>
		);
	}
}

export default WalletCreate;
