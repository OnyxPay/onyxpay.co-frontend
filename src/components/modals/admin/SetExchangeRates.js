import React, { Component } from "react";
import { Formik } from "formik";
import { Modal, Button, Input, Form } from "antd";
import { TextAligner } from "./../../styled";
import { setAssetExchangeRates } from "api/assets";
import { TimeoutError } from "promise-timeout";
import { showNotification, showTimeoutNotification } from "components/notification";

class SetExchangeRates extends Component {
	handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
		const { hideModal, getExchangeRates, tokenId } = this.props;
		const { assets_buy, asset_sell } = values;
		try {
			const res = await setAssetExchangeRates(tokenId, asset_sell, assets_buy);
			if (res.Error === 0) {
				showNotification({
					type: "success",
					msg: "Successfully set exchange rate",
				});
			}
			getExchangeRates();
			resetForm();
		} catch (e) {
			if (e instanceof TimeoutError) {
				showTimeoutNotification();
			} else {
				showNotification({
					type: "error",
					msg: e.message,
				});
				setSubmitting(false);
			}
		} finally {
			hideModal();
		}
	};

	render() {
		const { isModalVisible, hideModal } = this.props;
		return (
			<>
				<Modal
					title="Set exchange rates"
					visible={isModalVisible}
					onCancel={hideModal}
					footer={null}
					className="assets"
				>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ assets_buy: "", asset_sell: "" }}
						validate={({ assets_buy, asset_sell }) => {
							let errors = {};
							if (!assets_buy) {
								errors.assets_buy = "required";
							} else if (!+assets_buy) {
								errors.assets_buy = "only positive numbers allowed";
							} else if (assets_buy <= 0) {
								errors.assets_buy = "only positive numbers allowed";
							}
							if (!asset_sell) {
								errors.asset_sell = "required";
							} else if (!+asset_sell) {
								errors.asset_sell = "only positive numbers allowed";
							} else if (asset_sell >= assets_buy) {
								errors.asset_sell = "sell can't be bigger than buy";
							} else if (asset_sell <= 0) {
								errors.asset_sell = "only positive numbers allowed";
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
										label="Buy rate"
										required
										validateStatus={errors.assets_buy && touched.assets_buy ? "error" : ""}
										help={errors.assets_buy && touched.assets_buy ? errors.assets_buy : ""}
									>
										<Input
											name="assets_buy"
											placeholder="enter buy rate"
											disabled={isSubmitting}
											value={values.assets_buy}
											onChange={handleChange}
											onBlur={handleBlur}
										/>
									</Form.Item>

									<Form.Item
										label="Sell rate"
										required
										validateStatus={errors.asset_sell && touched.asset_sell ? "error" : ""}
										help={errors.asset_sell && touched.asset_sell ? errors.asset_sell : ""}
									>
										<Input
											name="asset_sell"
											placeholder="enter sell rate"
											disabled={isSubmitting}
											value={values.asset_sell}
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
											Set exchange rates
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

export default SetExchangeRates;
