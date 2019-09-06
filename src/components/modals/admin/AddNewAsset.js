import React, { Component } from "react";
import { Formik } from "formik";
import { Modal, Button, Input, Form } from "antd";
import { TextAligner } from "./../../styled";
import { addNewAsset } from "api/admin/assets";
import { handleBcError } from "api/network";
import { showNotification } from "components/notification";

class AddNewAsset extends Component {
	handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
		const { hideModal, getAssetsList } = this.props;
		const { assets_symbol, asset_name } = values;
		try {
			const res = await addNewAsset(assets_symbol, asset_name);
			if (res.Error === 0) {
				showNotification({
					type: "success",
					msg: "Asset was successfully added",
				});
			}
			getAssetsList();
			resetForm();
		} catch (e) {
			handleBcError(e);
			setSubmitting(false);
		} finally {
			hideModal();
		}
	};

	render() {
		const { isModalVisible, hideModal } = this.props;
		return (
			<>
				<Modal
					title="Add asset"
					className="assets-modal"
					visible={isModalVisible}
					onCancel={hideModal}
					footer={null}
				>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ assets_symbol: "", asset_name: "" }}
						validate={({ assets_symbol, asset_name }) => {
							let errors = {};
							if (!assets_symbol) {
								errors.assets_symbol = "Required field";
							}
							if (!asset_name) {
								errors.asset_name = "Required field";
							}
							return errors;
						}}
					>
						{props => {
							const {
								values,
								isSubmitting,
								handleChange,
								handleBlur,
								handleSubmit,
								errors,
								touched,
							} = props;
							return (
								<form onSubmit={handleSubmit}>
									<Form.Item
										label="Assets symbol"
										required
										validateStatus={errors.assets_symbol && touched.assets_symbol ? "error" : ""}
										help={errors.assets_symbol && touched.assets_symbol ? errors.assets_symbol : ""}
									>
										<Input
											name="assets_symbol"
											placeholder="enter assets symbol"
											disabled={isSubmitting}
											value={values.assets_symbol}
											onChange={handleChange}
											onBlur={handleBlur}
										/>
									</Form.Item>

									<Form.Item
										label="Asset name"
										required
										validateStatus={errors.asset_name && touched.asset_name ? "error" : ""}
										help={errors.asset_name && touched.asset_name ? errors.asset_name : ""}
									>
										<Input
											name="asset_name"
											placeholder="enter asset name"
											disabled={isSubmitting}
											value={values.asset_name}
											onChange={handleChange}
											onBlur={handleBlur}
										/>
									</Form.Item>
									<TextAligner align="right">
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
			</>
		);
	}
}

export default AddNewAsset;
