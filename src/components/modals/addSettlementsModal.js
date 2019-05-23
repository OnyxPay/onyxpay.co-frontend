import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Form, Input, Button } from "antd";

import { getStore } from "../../store";
import Actions from "../../redux/actions";
const store = getStore();

const { TextArea } = Input;

class AddSettlementtModal extends Component {
	handleCloseModal = () => {
		const { hideModal } = this.props;
		hideModal();
	};

	handleFormSubmit = (values, { resetForm }) => {
		let formData = new FormData();
		Object.keys(values).forEach(function(item) {
			formData.append(item, values[item]);
		});

		store.dispatch(Actions.settlements.addItem(formData));

		const { hideModal } = this.props;
		hideModal();
		resetForm();
	};

	render() {
		const { isModalVisible } = this.props;

		return (
			<Modal
				title="Add New Settlement Account"
				visible={isModalVisible}
				onCancel={this.handleCloseModal}
				footer={null}
				destroyOnClose
			>
				<Formik
					onSubmit={this.handleFormSubmit}
					initialValues={{
						account_number: "",
						account_name: "",
						description: "",
						brief_notes: "",
					}}
					validate={values => {
						let errors = {};
						if (!values.account_number) {
							errors.account_number = "required";
						}
						if (!values.account_name) {
							errors.account_name = "required";
						}
						if (!values.description) {
							errors.description = "required";
						}
						if (!values.brief_notes) {
							errors.brief_notes = "required";
						}
						return errors;
					}}
				>
					{({ values, errors, isSubmitting, handleChange, handleBlur, handleSubmit }) => {
						return (
							<form onSubmit={handleSubmit}>
								<Form.Item
									label="Account number"
									validateStatus={errors.account_number ? "error" : ""}
									help={errors.account_number ? errors.account_number : ""}
									required
								>
									<Input
										size="large"
										name="account_number"
										value={values.account_number}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Account name"
									validateStatus={errors.account_name ? "error" : ""}
									help={errors.account_name ? errors.account_name : ""}
									required
								>
									<Input
										size="large"
										name="account_name"
										value={values.account_name}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Description"
									validateStatus={errors.description ? "error" : ""}
									help={errors.description ? errors.description : ""}
									required
								>
									<TextArea
										rows={4}
										name="description"
										value={values.description}
										onChange={handleChange}
									/>
								</Form.Item>

								<Form.Item
									label="Brief notes"
									validateStatus={errors.brief_notes ? "error" : ""}
									help={errors.brief_notes ? errors.brief_notes : ""}
									required
								>
									<Input
										size="large"
										name="brief_notes"
										value={values.brief_notes}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Button type="primary" htmlType="submit" disabled={isSubmitting}>
									Submit
								</Button>
							</form>
						);
					}}
				</Formik>
			</Modal>
		);
	}
}

export default connect()(AddSettlementtModal);
