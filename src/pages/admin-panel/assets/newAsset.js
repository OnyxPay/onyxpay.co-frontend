import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Card, Button, Input, Form } from "antd";
import { TextAligner } from "./../../../components/styled";
import { addNewAssets } from "../../../redux/admin-panel/assets";

class NewAssets extends Component {
	handleFormSubmit = (values, { setSubmitting, resetForm }) => {
		const { addNewAssets } = this.props;
		const { assets_symbol } = values;
		const { asset_name } = values;
		addNewAssets(assets_symbol, asset_name, { setSubmitting, resetForm });
	};

	render() {
		return (
			<>
				<Card>
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
								<form onSubmit={handleSubmit} className="ant-form-w50">
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
				</Card>
			</>
		);
	}
}

export default connect(
	null,
	{ addNewAssets }
)(NewAssets);
