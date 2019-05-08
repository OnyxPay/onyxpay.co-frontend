import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { get } from "lodash";
import { Typography, Select, Form, Input, Upload, Button, Icon } from "antd";
import Tabs, { Tab, TabContent, TabsContainer, TabLabel, TabsNav } from "./tabs";
import { Wrapper, Card, SelectContainer, CardBody, UnlockTitle, FormButtons } from "./styled";
import { importMnemonics, importPrivateKey, getWallet } from "../../api/wallet";
import { isMnemonicsValid, isPkValid } from "../../utils/validate";
import Actions from "../../redux/actions";

/* 
	TODO:
	debounce validation
*/
const { Title } = Typography;
const Option = Select.Option;
const { TextArea } = Input;

function isLtSize(file, mbSize) {
	return file.size / 1024 / 1024 < mbSize;
}
class WalletUnlock extends Component {
	state = {
		value: 0,
		fileList: [],
		fileReadError: "",
		uploadedWallet: null,
	};

	handleTabChange = value => {
		this.setState({ value: Number(value) });
	};

	handleUnlockWithMnemonics = async ({ mnemonics, password }, { setSubmitting, resetForm }) => {
		console.log("sending", mnemonics, password);

		try {
			const { wallet } = await importMnemonics(mnemonics, password);
			console.log(wallet);
			//TODO: pass data to login API
			this.props.setWallet(wallet);
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

	handleUnlockWithPk = async ({ pk, password }, { setSubmitting, resetForm }) => {
		console.log("sending", pk, password);

		try {
			const { wallet } = await importPrivateKey(pk, password);
			console.log(wallet);
			this.props.setWallet(wallet);
		} catch (error) {
			console.log(error);
		} finally {
			setSubmitting(false);
		}
	};

	handleUnlockWithFile = async ({ password }, { setSubmitting, resetForm }) => {
		console.log("sending", password);
	};

	handleFileChange = ({ file, fileList }) => {
		const isLt1M = isLtSize(file, 1);
		fileList = fileList.slice(-1);

		if (isLt1M) {
			this.setState({ fileList, fileReadError: "" });
		} else {
			this.setState({ fileList: [], fileReadError: "wallet file is not valid" });
		}
	};

	handleFileUpload = (file, fileList) => {
		const isLt1M = isLtSize(file, 1);

		if (isLt1M) {
			const reader = new FileReader();
			reader.onloadend = async (e: any) => {
				let data = get(e.target, "result");
				try {
					const parsed = JSON.parse(data);
					if (parsed.identities == null) {
						parsed.identities = [];
						data = JSON.stringify(parsed);
					}
					const wallet = getWallet(JSON.parse(data)).toJsonObj();
					this.setState({ uploadedWallet: wallet });
				} catch (e) {
					console.log("reader.onloadend error - ", e);
					this.setState({ fileReadError: "wallet file is not valid" });
				}
			};
			reader.readAsText(file);
		} else {
			this.setState({ fileReadError: "wallet file is not valid" });
		}

		return false;
	};

	handleFileRemoval = file => {
		const { fileList } = this.state;
		console.log(file);
		if (file.name === fileList[0].name) {
			this.setState({ uploadedWallet: null });
		}
	};

	render() {
		const { value, fileList, fileReadError } = this.state;

		return (
			<Wrapper>
				<Card>
					<CardBody>
						<Title level={3} style={{ textAlign: "center" }}>
							Unlock Your Wallet
						</Title>

						<UnlockTitle>Select how you would like to unlock</UnlockTitle>

						<SelectContainer>
							<Select defaultValue="0" style={{ width: "100%" }} onChange={this.handleTabChange}>
								<Option value="0">Import wallet</Option>
								<Option value="1">Mnemonics phrase</Option>
								<Option value="2">Private key</Option>
							</Select>
						</SelectContainer>

						<TabsContainer>
							<TabsNav>
								<Tabs value={value} onChange={this.handleTabChange}>
									<Tab>
										<TabLabel>Import wallet</TabLabel>
									</Tab>
									<Tab>
										<TabLabel>Mnemonics phrase</TabLabel>
									</Tab>
									<Tab>
										<TabLabel>Private key</TabLabel>
									</Tab>
								</Tabs>
							</TabsNav>

							{/* Import wallet tab */}
							{value === 0 && (
								<TabContent>
									<div>
										<Formik
											onSubmit={this.handleUnlockWithFile}
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
															label="Select your wallet file"
															required
															validateStatus="error"
															help={fileReadError && fileReadError}
														>
															<Upload
																className="upload-wallet-container"
																fileList={fileList}
																multiple={false}
																onChange={this.handleFileChange}
																beforeUpload={this.handleFileUpload}
																onRemove={this.handleFileRemoval}
															>
																<Button block>
																	<Icon type="upload" /> Click here to upload file
																</Button>
															</Upload>
														</Form.Item>

														<Form.Item
															label="Temporary session password"
															className="ant-form-item--lh32"
															required
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

														<FormButtons isSubmitting={isSubmitting} />
													</form>
												);
											}}
										</Formik>
									</div>
								</TabContent>
							)}
							{/* Mnemonics tab */}
							{value === 1 && (
								<TabContent>
									<div>
										<Formik
											onSubmit={this.handleUnlockWithMnemonics}
											initialValues={{ mnemonics: "", password: "" }}
											validate={({ mnemonics, password }) => {
												let errors = {};
												if (!mnemonics) {
													errors.mnemonics = "required";
												} else if (!isMnemonicsValid(mnemonics)) {
													errors.mnemonics = "mnemonics phrase is not valid";
												}
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
															label="Please enter your 24 word phrase"
															required
															validateStatus={errors.mnemonics && touched.mnemonics ? "error" : ""}
															help={errors.mnemonics && touched.mnemonics ? errors.mnemonics : ""}
														>
															<TextArea
																name="mnemonics"
																value={values.mnemonics}
																onChange={handleChange}
																onBlur={handleBlur}
																disabled={isSubmitting}
																rows={3}
																style={{ resize: "none" }}
															/>
														</Form.Item>

														<Form.Item
															label="Temporary session password"
															className="ant-form-item--lh32"
															required
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

														<FormButtons isSubmitting={isSubmitting} />
													</form>
												);
											}}
										</Formik>
									</div>
								</TabContent>
							)}
							{/* Private key tab */}
							{value === 2 && (
								<TabContent>
									<div>
										<Formik
											onSubmit={this.handleUnlockWithPk}
											initialValues={{ pk: "", password: "" }}
											validate={({ pk, password }) => {
												let errors = {};
												if (!pk) {
													errors.pk = "required";
												} else if (!isPkValid(pk)) {
													errors.pk = "Private key is not valid";
												}
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
															label="Please enter your private key"
															required
															validateStatus={errors.pk && touched.pk ? "error" : ""}
															help={errors.pk && touched.pk ? errors.pk : ""}
														>
															<TextArea
																name="pk"
																value={values.pk}
																onChange={handleChange}
																onBlur={handleBlur}
																disabled={isSubmitting}
																rows={2}
																style={{ resize: "none" }}
															/>
														</Form.Item>

														<Form.Item
															label="Temporary session password"
															className="ant-form-item--lh32"
															required
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

														<FormButtons isSubmitting={isSubmitting} />
													</form>
												);
											}}
										</Formik>
									</div>
								</TabContent>
							)}
						</TabsContainer>
					</CardBody>
				</Card>
			</Wrapper>
		);
	}
}

export default connect(
	null,
	{ setWallet: Actions.wallet.setWallet }
)(WalletUnlock);
