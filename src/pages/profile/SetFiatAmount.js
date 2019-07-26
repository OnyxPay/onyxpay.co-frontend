import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Input, Form, Select, Row, Col, Card } from "antd";
import { Formik } from "formik";
import Actions from "../../redux/actions";
import { TextAligner } from "../../components/styled";
import { setFiatAmount } from "../../api/assets";
import { TimeoutError } from "promise-timeout";
import { isAssetBlocked } from "../../api/assets";
import { countDecimals } from "../../utils/validate";
import { roles } from "api/constants";
import {
	showNotification,
	showTimeoutNotification,
	showGasCompensationError,
	showBcError,
} from "components/notification";
import { GasCompensationError, SendRawTrxError } from "utils/custom-error";

const { Option } = Select;

class SetFiatAmount extends Component {
	componentDidMount() {
		const { getAssetsList } = this.props;
		getAssetsList();
	}

	handleFormSubmit = async (values, formActions) => {
		try {
			const isBlocked = await isAssetBlocked(values.asset_symbol);
			if (isBlocked) {
				formActions.setSubmitting(false);
				return formActions.setFieldError("asset_symbol", "asset is blocked at the moment");
			}

			await setFiatAmount(values.asset_symbol, values.amount);
			formActions.resetForm();
			showNotification({
				type: "success",
				msg: `Fiat amount of ${values.asset_symbol} is set to ${values.amount}`,
			});
		} catch (e) {
			if (e instanceof GasCompensationError) {
				showGasCompensationError();
			} else if (e instanceof SendRawTrxError) {
				showBcError(e.message);
			} else if (e instanceof TimeoutError) {
				showTimeoutNotification();
			}
		}

		formActions.setSubmitting(false);
	};

	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
	};

	render() {
		const { assets, user } = this.props;
		if (user && user.role !== roles.a) {
			return null;
		}

		return (
			<Card style={{ marginBottom: 24 }}>
				<h3>
					<b>Set fiat amount</b>
				</h3>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={{
						asset_symbol: "oUSD",
						amount: "",
					}}
					validate={values => {
						let errors = {};
						if (!values.asset_symbol) {
							errors.asset_symbol = "required";
						}
						if (!values.amount) {
							errors.amount = "required";
						} else if (values.amount <= 0) {
							errors.amount = "only positive values are allowed";
						} else if (values.amount < 1) {
							errors.amount = "min amount is 1";
						} else if (countDecimals(values.amount) > 8) {
							errors.amount = "max number of decimal places is 8";
						}

						return errors;
					}}
				>
					{({
						values,
						errors,
						isSubmitting,
						handleChange,
						handleBlur,
						handleSubmit,
						setFieldValue,
						touched,
						setFieldError,
					}) => {
						return (
							<form onSubmit={handleSubmit}>
								<Row gutter={16} type="flex">
									<Col xs={24} lg={12}>
										<Form.Item
											label="Asset"
											required
											validateStatus={errors.asset_symbol && touched.asset_symbol ? "error" : ""}
											help={errors.asset_symbol && touched.asset_symbol ? errors.asset_symbol : ""}
										>
											<Select
												showSearch
												name="asset_symbol"
												placeholder="Select an asset"
												optionFilterProp="children"
												value={values.asset_symbol}
												onChange={this.handleAssetChange(setFieldValue)}
												filterOption={(input, option) =>
													option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
												}
												disabled={isSubmitting}
											>
												{assets.map((asset, index) => {
													return (
														<Option key={index} value={asset}>
															{asset}
														</Option>
													);
												})}
											</Select>
										</Form.Item>
									</Col>

									<Col xs={24} lg={12}>
										<Form.Item
											label="Amount"
											required
											validateStatus={errors.amount && touched.amount ? "error" : ""}
											help={errors.amount && touched.amount ? errors.amount : ""}
										>
											<Input
												name="amount"
												type="number"
												placeholder="Enter an amount"
												value={values.amount}
												onChange={handleChange}
												onBlur={handleBlur}
												disabled={isSubmitting}
												step="any"
											/>
										</Form.Item>
									</Col>
								</Row>
								<TextAligner align="right" mobile="left">
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
										Set
									</Button>
								</TextAligner>
							</form>
						);
					}}
				</Formik>
			</Card>
		);
	}
}

export default connect(
	state => {
		return {
			user: state.user,
			assets: state.assets.list,
		};
	},
	{
		getAssetsList: Actions.assets.getAssetsList,
	}
)(SetFiatAmount);
