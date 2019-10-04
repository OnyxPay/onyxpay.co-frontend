import React from "react";
import { Modal, Input, Typography, Form, Button } from "antd";
import { TextAligner } from "components/styled";
import { Formik } from "formik";

const { Text } = Typography;

function DeleteWalletAccount({ isModalVisible, hideModal, address, handleDeleteAccount }) {
	const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
		try {
			handleDeleteAccount();
			resetForm();
		} catch (e) {
			setSubmitting(false);
		} finally {
			hideModal();
		}
	};

	return (
		<div>
			<Modal
				title={`Delete address: ${address} `}
				visible={isModalVisible}
				onCancel={hideModal}
				okText="Delete"
				footer={null}
			>
				<Text type="danger">
					Please pay attention that this operation will lead to losing access to the account you are
					deleting. Tou can restore it only by using a mnemonic phrase or private key.
				</Text>
				<Formik
					onSubmit={handleFormSubmit}
					initialValues={{ phrase: "" }}
					validate={({ phrase }) => {
						let errors = {};
						if (!phrase) {
							errors.phrase = "Required field";
						} else if (phrase.toLowerCase() !== "delete") {
							errors.phrase = 'Please, enter the word "delete"';
						}
						return errors;
					}}
				>
					{({
						values,
						errors,
						touched,
						isSubmitting,
						handleBlur,
						handleSubmit,
						handleChange,
						...rest
					}) => {
						return (
							<form onSubmit={handleSubmit}>
								<Form.Item
									label='Enter "delete" to confirm operation'
									required
									validateStatus={errors.phrase && touched.phrase ? "error" : ""}
									help={errors.phrase && touched.phrase ? errors.phrase : ""}
								>
									<Input
										name="phrase"
										onChange={handleChange}
										value={values.phrase}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>
								<TextAligner align="right">
									<Button style={{ marginRight: 10 }} type="primary" onClick={hideModal}>
										Cancel
									</Button>
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
										Add asset
									</Button>
								</TextAligner>
							</form>
						);
					}}
				</Formik>
			</Modal>
		</div>
	);
}

export default DeleteWalletAccount;
