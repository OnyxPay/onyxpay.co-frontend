import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Select, Form, Button } from "antd";
import { getData as getCountriesData } from "country-list";
import { Formik } from "formik";
import AgentsTable from "./AgentsTable";
import { searchUsers } from "../../../api/users";
import { sendMessage } from "../../../api/operation-messages";

const { Option } = Select;

class SendToAgent extends Component {
	state = this.getInitialState();

	getInitialState() {
		return {
			loading: false,
			users: null,
			selectedRows: [],
			selectedRowKeys: [],
			pagination: { current: 1, pageSize: 2 },
		};
	}

	componentDidUpdate(prevProps, prevState) {
		const { isModalVisible } = this.props;

		if (isModalVisible && prevProps.isModalVisible !== isModalVisible) {
			this.fetchUsers();
		}
	}

	handleFormSubmit = async (values, formActions) => {
		const { requestId } = this.props;
		const { selectedRows } = this.state;
		const ids = [];
		selectedRows.forEach(row => {
			ids.push(row.user_id);
		});
		await sendMessage(requestId, ids);
		formActions.resetForm();
	};

	handleTableChange = (pagination, filters, sorter) => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				this.fetchUsers({
					...filters,
				});
			}
		);
	};

	handleCountryChange = (setFieldValue, setSubmitting) => async countryId => {
		await this.fetchUsers({
			country: countryId,
		});
		setFieldValue("country", countryId);
	};

	async fetchUsers(opts = {}) {
		try {
			const { pagination } = this.state;
			const { user } = this.props;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				role: "agent",
				country: user.countryId,
				...opts,
			};

			this.setState({ loading: true });
			const res = await searchUsers(params);
			pagination.total = res.total;
			this.setState({ loading: false, users: res, pagination });
		} catch (e) {}
	}

	handleClose = () => {
		this.props.hideModal();
		this.setState(this.getInitialState());
	};

	onSelectedRow = (selectedRowKeys, selectedRows) => {
		this.setState({ selectedRowKeys, selectedRows });
	};

	render() {
		const { isModalVisible, user } = this.props;
		const { loading, users, selectedRowKeys } = this.state;

		return (
			<Modal
				title="Send deposit request to agent/agents"
				visible={isModalVisible}
				onCancel={this.handleClose}
				footer={null}
				destroyOnClose={true}
				className="send-to-agents-modal"
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

									<AgentsTable
										loading={loading}
										data={users}
										onSelectedRowKeysChange={this.onSelectedRow}
										selectedRowKeys={selectedRowKeys}
										pagination={this.state.pagination}
										onChange={this.handleTableChange}
									/>
									<div className="ant-modal-custom-footer">
										<Button key="back" onClick={this.handleClose} style={{ marginRight: 10 }}>
											Cancel
										</Button>
										<Button
											type="primary"
											htmlType="submit"
											disabled={!selectedRowKeys.length || isSubmitting}
											loading={isSubmitting}
										>
											Send request
										</Button>
									</div>
								</form>
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
