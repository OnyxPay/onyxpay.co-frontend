import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Typography, Select, Form, Input, Upload, Button, Icon } from "antd";
import { get } from "lodash";
import Tabs, { Tab, TabContent, TabsContainer, TabLabel, TabsNav } from "./tabs";
import { SelectContainer, ImportTitle, FormButtons } from "./styled";
import { importMnemonics, importPrivateKey, getWallet } from "api/wallet";
import { isMnemonicsValid, isPkValid, samePassword } from "utils/validate";
import Actions from "redux/actions";
import { showNotification } from "components/notification";

/* 
	TODO:
	* debounce validation
	* refactor repetition
*/

const { Title } = Typography;
const Option = Select.Option;
const { TextArea } = Input;

function isLtSize(file, mbSize) {
	return file.size / 1024 / 1024 < mbSize;
}

class ImportWalletModal extends Component {
	state = this.initState();

	initState() {
		return {
			activeTabIndex: 0,
			fileList: [],
			fileReadError: "",
			uploadedWallet: null,
			importWalletAccounts: [],
			currentWallet: [],
		};
	}

	handleTabChange = activeTabIndex => {
		const initialState = this.initState();
		this.setState({ ...initialState, activeTabIndex: Number(activeTabIndex) });
	};

	handleUnlockWithMnemonics = async ({ mnemonics, password }, formActions) => {
		const { hideModal } = this.props;
		try {
			let wallet;
			let currentWallet = JSON.parse(localStorage.getItem("wallet"));

			if (currentWallet) {
				({ wallet } = await importMnemonics(mnemonics, password, currentWallet));
			} else {
				({ wallet } = await importMnemonics(mnemonics, password));
			}

			this.props.setWallet(wallet);
			formActions.resetForm();
			this.setState({ ...this.initState() });
			hideModal();
			if (currentWallet && JSON.parse(wallet).accounts.length === currentWallet.accounts.length) {
				showNotification({
					type: "success",
					msg: "This address has already been added by you",
				});
			} else {
				showNotification({
					type: "success",
					msg: "You successfully added your address",
				});
			}
		} catch (error) {
			console.log(error);
		} finally {
			formActions.setSubmitting(false);
		}
	};

	handleUnlockWithPk = async ({ pk, password }, formActions) => {
		const { hideModal } = this.props;
		try {
			let wallet;
			let currentWallet = JSON.parse(localStorage.getItem("wallet"));

			if (currentWallet) {
				({ wallet } = await importPrivateKey(pk.trim(), password, currentWallet));
			} else {
				({ wallet } = await importPrivateKey(pk.trim(), password));
			}

			this.props.setWallet(wallet);
			formActions.resetForm();
			this.setState({ ...this.initState() });
			hideModal();
			if (currentWallet && JSON.parse(wallet).accounts.length === currentWallet.accounts.length) {
				showNotification({
					type: "success",
					msg: "This address has already been added by you",
				});
			} else {
				showNotification({
					type: "success",
					msg: "You successfully added your address",
				});
			}
		} catch (error) {
			console.log(error);
		} finally {
			formActions.setSubmitting(false);
		}
	};

	handleUnlockWithFile = async ({ wallet_account_address }, formActions) => {
		let { uploadedWallet, currentWallet } = this.state;
		const { hideModal } = this.props;

		try {
			if (currentWallet) {
				if (wallet_account_address === "Import all addresses") {
					this.setState(() => {
						return {
							currentWallet: uploadedWallet.accounts.map(account =>
								currentWallet.accounts.push(account)
							),
						};
					});
				} else {
					this.setState(() => {
						return {
							currentWallet: uploadedWallet.accounts.map(
								account =>
									account.address === wallet_account_address && currentWallet.accounts.push(account)
							),
						};
					});
				}
			} else if (uploadedWallet) {
				if (wallet_account_address !== "Import all addresses") {
					const uploadAddress = uploadedWallet.accounts.filter(
						account => account.address === wallet_account_address
					);
					this.setState({ uploadedWallet: (uploadedWallet.accounts = uploadAddress) });
				}
			}

			this.props.setWallet(currentWallet ? currentWallet : uploadedWallet);
			formActions.resetForm();
			this.setState({ ...this.initState() });
			hideModal();
			showNotification({
				type: "success",
				msg: "You successfully imported your wallet with address/addresses",
			});
		} catch (error) {
			if (error === 53000) {
				formActions.setFieldError("password", "Account's password is not correct");
			}
		} finally {
			formActions.setSubmitting(false);
		}
	};

	handleFileChange = ({ file, fileList }) => {
		const isLt1M = isLtSize(file, 1);
		fileList = fileList.slice(-1);

		if (isLt1M) {
			this.setState({ fileList, fileReadError: "" });
		} else {
			this.setState({ fileList: [], fileReadError: "Wallet file is not valid" });
		}
	};

	handleFileUpload = setFieldValue => (file, formActions) => {
		const isLt1M = isLtSize(file, 1);

		if (isLt1M) {
			const reader = new FileReader();
			reader.onloadend = async e => {
				let data = get(e.target, "result");
				try {
					let wallet = getWallet(JSON.parse(data)).toJsonObj();
					const importWalletAccounts = wallet.accounts.map((account, index) => ({
						address: account.address,
						key: index,
					}));
					this.setState({ importWalletAccounts });

					let currentWallet = JSON.parse(localStorage.getItem("wallet"));

					if (currentWallet) {
						const currentAddresses = this.props.wallet.accounts.map(account => account.address);
						const importAddresses = wallet.accounts.filter(
							account => !currentAddresses.includes(account.address)
						);

						if (importAddresses.length === 0) {
							this.setState({
								fileReadError: `Import wallet contains the address/addresses already added`,
							});
						} else if (importAddresses.length === 1) {
							setFieldValue("wallet_account_address", importAddresses[0].address);
						} else if (importAddresses.length > 2) {
							setFieldValue("wallet_account_address", "Import all addresses");
						}

						this.setState({ importWalletAccounts: importAddresses });
						wallet.accounts = importAddresses;
					} else if (importWalletAccounts.length > 2) {
						setFieldValue("wallet_account_address", "Import all addresses");
					} else {
						setFieldValue("wallet_account_address", importWalletAccounts[0].address);
					}
					this.setState({ uploadedWallet: wallet, currentWallet: currentWallet });
				} catch (e) {
					this.setState({ fileReadError: "Wallet file is not valid" });
				}
			};
			reader.readAsText(file);
		} else {
			this.setState({ fileReadError: "Wallet file is not valid" });
		}

		return false;
	};

	handleFileRemoval = setFieldValue => file => {
		const { fileList } = this.state;
		if (file.name === fileList[0].name) {
			this.setState({ uploadedWallet: null });
			setFieldValue("wallet_account_address", "");
		}
	};

	handleAccountChange = setFieldValue => (value, option) => {
		this.setState({ choseAddress: value });
		setFieldValue("wallet_account_address", value);
	};

	render() {
		const { isModalVisible, hideModal, switchModal } = this.props;
		const {
			activeTabIndex,
			fileList,
			fileReadError,
			uploadedWallet,
			importWalletAccounts,
		} = this.state;
		return (
			<Modal
				title=""
				visible={isModalVisible}
				onCancel={hideModal}
				footer={null}
				className="import-wallet-modal"
			>
				<div>
					<Title level={3} style={{ textAlign: "center" }}>
						Import Address
					</Title>

					<ImportTitle>Select how you would like to import</ImportTitle>

					<SelectContainer>
						<Select defaultValue="0" style={{ width: "100%" }} onChange={this.handleTabChange}>
							<Option value="0">Import wallet</Option>
							<Option value="1">Mnemonic phrase</Option>
							<Option value="2">Private key</Option>
						</Select>
					</SelectContainer>

					<TabsContainer>
						<TabsNav>
							<Tabs value={activeTabIndex} onChange={this.handleTabChange}>
								<Tab>
									<TabLabel>Import wallet file</TabLabel>
								</Tab>
								<Tab>
									<TabLabel>Mnemonic phrase</TabLabel>
								</Tab>
								<Tab>
									<TabLabel>Private key</TabLabel>
								</Tab>
							</Tabs>
						</TabsNav>

						{/* Import wallet tab */}
						{activeTabIndex === 0 && (
							<TabContent>
								<div>
									<Formik
										onSubmit={this.handleUnlockWithFile}
										initialValues={{ wallet_account_address: "" }}
										validate={({ wallet_account_address }) => {
											let errors = {};

											if (!wallet_account_address) {
												errors.wallet_account_address = "Required field";
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
														label="Select your wallet file"
														validateStatus="error"
														help={fileReadError && fileReadError}
														className="ant-form-item--lh32"
													>
														<Upload
															className="upload-wallet-container"
															fileList={fileList}
															multiple={false}
															onChange={this.handleFileChange}
															beforeUpload={this.handleFileUpload(setFieldValue)}
															onRemove={this.handleFileRemoval(setFieldValue)}
														>
															<Button block>
																<Icon type="upload" /> Click here to upload file
															</Button>
														</Upload>
													</Form.Item>

													<Form.Item
														label="Choose address"
														className="ant-form-item--lh32"
														validateStatus={
															errors.wallet_account_address && touched.wallet_account_address
																? "error"
																: ""
														}
														help={
															errors.wallet_account_address && touched.wallet_account_address
																? errors.wallet_account_address
																: ""
														}
													>
														<Select
															showSearch
															name="wallet_account_address"
															optionFilterProp="children"
															value={values.wallet_account_address}
															onChange={this.handleAccountChange(setFieldValue)}
															filterOption={(input, option) =>
																option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
																0
															}
															disabled={
																!uploadedWallet || isSubmitting || importWalletAccounts.length === 0
															}
														>
															{importWalletAccounts.length > 2 && (
																<Option value="Import all addresses">Import all addresses</Option>
															)}
															{importWalletAccounts ? (
																importWalletAccounts.map(acc => {
																	return (
																		<Option key={acc.key} value={acc.address}>
																			{acc.address}
																		</Option>
																	);
																})
															) : (
																<Option key="fdf">none</Option>
															)}
														</Select>
													</Form.Item>

													<FormButtons isSubmitting={isSubmitting} switchModal={switchModal} />
												</form>
											);
										}}
									</Formik>
								</div>
							</TabContent>
						)}
						{/* Mnemonics tab */}
						{activeTabIndex === 1 && (
							<TabContent>
								<div>
									<Formik
										onSubmit={this.handleUnlockWithMnemonics}
										initialValues={{ mnemonics: "", password: "", password_confirm: "" }}
										validate={({ mnemonics, password, password_confirm }) => {
											let errors = {};
											if (!password) {
												errors.password = "Required field";
											} else if (!password_confirm) {
												errors.password_confirm = "Required field";
											} else {
												errors = samePassword({ password, password_confirm });
											}
											if (!mnemonics) {
												errors.mnemonics = "Required field";
											} else if (!isMnemonicsValid(mnemonics)) {
												errors.mnemonics = "Mnemonic phrase is not valid";
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
														label="Password"
														className="ant-form-item--lh32"
														validateStatus={errors.password && touched.password ? "error" : ""}
														help={errors.password && touched.password ? errors.password : ""}
													>
														<Input.Password
															name="password"
															type="password"
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
															type="password"
															value={values.password_confirm}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
														/>
													</Form.Item>

													<FormButtons isSubmitting={isSubmitting} switchModal={switchModal} />
												</form>
											);
										}}
									</Formik>
								</div>
							</TabContent>
						)}
						{/* Private key tab */}
						{activeTabIndex === 2 && (
							<TabContent>
								<div>
									<Formik
										onSubmit={this.handleUnlockWithPk}
										initialValues={{ pk: "", password: "", password_confirm: "" }}
										validate={({ pk, password, password_confirm }) => {
											let errors = {};
											if (!password) {
												errors.password = "Required field";
											} else if (!password_confirm) {
												errors.password_confirm = "Required field";
											} else {
												errors = samePassword({ password, password_confirm });
											}
											if (!pk) {
												errors.pk = "Required field";
											} else if (!isPkValid(pk.trim())) {
												errors.pk = "Private key is not valid";
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
														label="Password"
														className="ant-form-item--lh32"
														validateStatus={errors.password && touched.password ? "error" : ""}
														help={errors.password && touched.password ? errors.password : ""}
													>
														<Input.Password
															name="password"
															type="password"
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
															type="password"
															value={values.password_confirm}
															onChange={handleChange}
															onBlur={handleBlur}
															disabled={isSubmitting}
														/>
													</Form.Item>

													<FormButtons isSubmitting={isSubmitting} switchModal={switchModal} />
												</form>
											);
										}}
									</Formik>
								</div>
							</TabContent>
						)}
					</TabsContainer>
				</div>
			</Modal>
		);
	}
}

export default connect(
	state => {
		return { wallet: state.wallet };
	},
	{
		setWallet: Actions.wallet.setWallet,
		showWalletUnlockModal: Actions.walletUnlock.showWalletUnlockModal,
	}
)(ImportWalletModal);
