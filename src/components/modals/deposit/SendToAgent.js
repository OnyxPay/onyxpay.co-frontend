import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Select, Form } from "antd";
import { getData as getCountriesData } from "country-list";
import { Formik } from "formik";
import AgentsTable from "./AgentsTable";
import { searchUsers } from "../../../api/users";

const { Option } = Select;

class SendToAgent extends Component {
	state = { loading: false, users: null };

	componentDidMount() {
		const { user } = this.props;
		this.fetchUsers(user.countryId);
	}

	handleCountryChange = (setFieldValue, setSubmitting) => async countryId => {
		console.log("handleCountryChange", countryId);
		// setSubmitting(true);
		await this.fetchUsers(countryId);
		setFieldValue("country", countryId);
	};

	async fetchUsers(countryId) {
		this.setState({ loading: true });
		const res = await searchUsers({ role: "agent", country: countryId });
		this.setState({ loading: false, users: res });
		console.log(res);
	}

	handleFormSubmit = (values, formActions) => {
		console.log("sending", values);
		// formActions.resetForm();
	};

	render() {
		const { isModalVisible, hideModal, user } = this.props;
		const { loading, users } = this.state;

		console.log("rendered");
		return (
			<Modal
				title=""
				visible={isModalVisible}
				onCancel={hideModal}
				footer={null}
				destroyOnClose={true}
			>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={{ country: user ? user.countryId : "" }}
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
						setSubmitting,
					}) => {
						return (
							<div>
								<form onSubmit={handleSubmit}>
									<Form.Item
										label="Country"
										validateStatus={errors.country && touched.country ? "error" : ""}
										help={errors.country && touched.country ? errors.country : ""}
									>
										<Select
											showSearch
											name="country"
											placeholder="Select a country"
											optionFilterProp="children"
											value={values.country}
											onChange={this.handleCountryChange(setFieldValue, setSubmitting)}
											filterOption={(input, option) =>
												option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
											}
											disabled={isSubmitting}
											loading={isSubmitting}
										>
											{getCountriesData().map((country, index) => {
												return (
													<Option key={country.code} value={country.code}>
														{country.name}
													</Option>
												);
											})}
										</Select>
									</Form.Item>
								</form>
								<AgentsTable loading={loading} data={users} />
							</div>
						);
					}}
				</Formik>
			</Modal>
		);
	}
}

export default connect(state => {
	return {
		user: state.user,
	};
})(SendToAgent);
