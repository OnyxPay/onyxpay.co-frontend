import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../../redux/actions";
import { Card, Button, Form, Select, Row, Col } from "antd";
import { Formik } from "formik";
import { blockAsset, isBlockedAssets } from "../../../redux/admin-panel/assets";

const { Option } = Select;

class BlockAssets extends Component {
	handleAssetChange = setFieldValue => async (value, option) => {
		setFieldValue("asset_symbol", value);
		this.setState({
			asset_symbol: value,
		});
	};

	handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
		const { blockAsset, isBlockedAssets } = this.props;
		const { asset_symbol } = values;
		const res = await blockAsset(asset_symbol, { setSubmitting, resetForm });
		if (!res) {
			return false;
		}
		await isBlockedAssets(asset_symbol);
	};

	componentDidMount() {
		const { getAssetsList } = this.props;
		getAssetsList();
	}

	render() {
		const { assets } = this.props;

		return (
			<>
				<Card>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							asset_symbol: "oUSD",
						}}
						validate={values => {
							let errors = {};
							if (!values.asset_symbol) {
								errors.asset_symbol = "required";
							}
							return errors;
						}}
					>
						{({ values, errors, isSubmitting, handleSubmit, setFieldValue, touched }) => {
							return (
								<form onSubmit={handleSubmit}>
									<Row gutter={16}>
										<Col lg={12} md={24}>
											<Form.Item
												label="Asset"
												required
												validateStatus={errors.asset_symbol && touched.asset_symbol ? "error" : ""}
												help={
													errors.asset_symbol && touched.asset_symbol ? errors.asset_symbol : ""
												}
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
												<Button
													type="primary"
													htmlType="submit"
													disabled={isSubmitting}
													loading={isSubmitting}
												>
													Block asset
												</Button>
											</Form.Item>
										</Col>
									</Row>
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
	state => {
		return {
			assets: state.assets.list,
		};
	},
	{
		getAssetsList: Actions.assets.getAssetsList,
		blockAsset,
		isBlockedAssets,
	}
)(BlockAssets);
