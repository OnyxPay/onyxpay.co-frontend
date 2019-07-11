import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Button, Input, Form, notification, message } from "antd";
import { TextAligner } from "../../styled";
import { setAssetExchangeRates } from "../../../api/assets";
import Actions from "../../../redux/actions";
import { TimeoutError } from "promise-timeout";

class SetExchangeRates extends Component {
	handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
		const { hideModal, getExchangeRates, tokenId } = this.props;
		const { assets_buy, asset_sell } = values;
		try {
			const res = await setAssetExchangeRates(tokenId, asset_sell, assets_buy);
			if (res.Error === 0) {
				message.success("Successfully set exchange rate");
			}
			getExchangeRates();
			resetForm();
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
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
				>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{ assets_buy: "", asset_sell: "" }}
						validate={({ assets_buy, asset_sell }) => {
							let errors = {};
							if (!assets_buy) {
								errors.assets_buy = "required";
							} else if (!+assets_buy) {
								errors.assets_buy = "entered value must the number";
							}
							if (!asset_sell) {
								errors.asset_sell = "required";
							} else if (!+asset_sell) {
								errors.asset_sell = "entered value must the number";
							} else if (asset_sell >= assets_buy) {
								errors.asset_sell = "sell can't be bigger than buy";
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
										label="Asset buy"
										required
										validateStatus={errors.assets_buy && touched.assets_buy ? "error" : ""}
										help={errors.assets_buy && touched.assets_buy ? errors.assets_buy : ""}
									>
										<Input
											name="assets_buy"
											placeholder="enter asset buy"
											disabled={isSubmitting}
											value={values.assets_buy}
											onChange={handleChange}
											onBlur={handleBlur}
										/>
									</Form.Item>

									<Form.Item
										label="Asset sell"
										required
										validateStatus={errors.asset_sell && touched.asset_sell ? "error" : ""}
										help={errors.asset_sell && touched.asset_sell ? errors.asset_sell : ""}
									>
										<Input
											name="asset_sell"
											placeholder="enter asset sell"
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

export default connect(
	null,
	{ getExchangeRates: Actions.assets.getExchangeRates }
)(SetExchangeRates);
