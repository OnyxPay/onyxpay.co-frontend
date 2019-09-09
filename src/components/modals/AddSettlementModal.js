import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Form, Input, Button } from "antd";
import Actions from "../../redux/actions";

const { TextArea } = Input;

class AddSettlementModal extends Component {
	handleFormSubmit = async (values, formActions) => {
		const { add, hideModal } = this.props;
		if (values.brief_notes === "") {
			delete values.brief_notes;
		}
		if (values.description === "") {
			delete values.description;
		}
		const res = await add(values);
		console.log(res);
		if (res && res.error && res.error.data) {
			formActions.setSubmitting(false);
			formActions.setErrors(res.error.data);
		} else {
			formActions.resetForm();
			hideModal();
		}
	};

	render() {
		const { isModalVisible, hideModal } = this.props;

		return (
			<Modal
				title="Add New Settlement Account"
				visible={isModalVisible}
				onCancel={hideModal}
				footer={null}
				destroyOnClose
				className="add-settlement-modal"
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
							errors.account_number = "Required field";
						}
						if (!values.account_name) {
							errors.account_name = "Required field";
						}
						return errors;
					}}
				>
					{({ values, errors, isSubmitting, handleChange, handleBlur, handleSubmit, touched }) => {
						return (
							<form onSubmit={handleSubmit}>
								<Form.Item
									label="Account number"
									validateStatus={errors.account_number && touched.account_number ? "error" : ""}
									help={
										errors.account_number && touched.account_number ? errors.account_number : ""
									}
									required
									className="ant-form-item"
								>
									<Input
										name="account_number"
										value={values.account_number}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Account name"
									validateStatus={errors.account_name && touched.account_name ? "error" : ""}
									help={errors.account_name && touched.account_name ? errors.account_name : ""}
									required
									className="ant-form-item"
								>
									<Input
										name="account_name"
										value={values.account_name}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Description"
									validateStatus={errors.description && touched.description ? "error" : ""}
									help={errors.description && touched.description ? errors.description : ""}
									className="ant-form-item"
								>
									<TextArea
										rows={4}
										style={{ resize: "none" }}
										name="description"
										value={values.description}
										onChange={handleChange}
										disabled={isSubmitting}
									/>
								</Form.Item>

								<Form.Item
									label="Brief notes"
									validateStatus={errors.brief_notes && touched.brief_notes ? "error" : ""}
									help={errors.brief_notes && touched.brief_notes ? errors.brief_notes : ""}
									className="ant-form-item"
								>
									<Input
										name="brief_notes"
										value={values.brief_notes}
										onChange={handleChange}
										onBlur={handleBlur}
										disabled={isSubmitting}
									/>
								</Form.Item>
								<div className="ant-modal-custom-footer">
									<Button
										type="primary"
										htmlType="submit"
										disabled={isSubmitting}
										loading={isSubmitting}
									>
										Add
									</Button>
								</div>
							</form>
						);
					}}
				</Formik>
			</Modal>
		);
	}
}

export default connect(
	null,
	{ add: Actions.settlements.add }
)(AddSettlementModal);
