import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Button, Input, Form, notification, message } from "antd";
import { TextAligner } from "../../styled";
import { addNewAsset } from "../../../api/admin/assets";
import Actions from "../../../redux/actions";
import { TimeoutError } from "promise-timeout";

class AddNewAsset extends Component {
	handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
		const { hideModal, getAssetsList } = this.props;
		const { assets_symbol, asset_name } = values;
		try {
			await addNewAsset(assets_symbol, asset_name);
			getAssetsList();
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		}
		hideModal();
	};

	render() {
		const { isModalVisible, hideModal } = this.props;
		return (
			<>
				<Modal title="Add asset" visible={isModalVisible} onCancel={hideModal} footer={null}>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ assets_symbol: "", asset_name: "" }}
						validate={({ assets_symbol, asset_name }) => {
							let errors = {};
							if (!assets_symbol) {
								errors.assets_symbol = "required";
							}
							if (!asset_name) {
								errors.asset_name = "required";
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
											size="large"
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
											size="large"
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

export default connect(
	null,
	{ getAssetsList: Actions.assets.getAssetsList }
)(AddNewAsset);
