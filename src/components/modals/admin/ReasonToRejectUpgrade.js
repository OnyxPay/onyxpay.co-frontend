import { Modal } from "antd";
import React, { Component } from "react";
import { Input, Form, Button } from "antd";
import { Formik } from "formik";
const { TextArea } = Input;

class ReasonToRejectUpgradeModal extends Component {
	handleFormSubmit = async (values, formActions) => {
		this.props.handleRejectRequest(values.reason);
	};

	render() {
		const { visible, hideModal, handleRejectRequest } = this.props;
		return (
			<div>
				<Modal
					title=""
					visible={visible}
					onCancel={hideModal}
					footer={null}
					className="reason-to-reject-modal"
				>
					<Formik
						onSubmit={this.handleFormSubmit}
						initialValues={{
							reason: "",
						}}
						validate={values => {
							let errors = {};
							if (!values.reason) {
								errors.reason = "required";
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
									<Form.Item
										label="Reason to reject"
										required
										validateStatus={errors.reason && touched.reason ? "error" : ""}
										help={errors.reason && touched.reason ? errors.reason : ""}
									>
										<TextArea
											name="reason"
											placeholder="Please enter the reason"
											autosize={{ minRows: 2, maxRows: 6 }}
											value={values.reason}
											onChange={handleChange}
											onBlur={handleBlur}
											disabled={isSubmitting}
										/>
									</Form.Item>

									<div className="ant-modal-custom-footer">
										<Button key="back" onClick={() => hideModal(false)} style={{ marginRight: 10 }}>
											Cancel
										</Button>
										<Button
											type="danger"
											htmlType="submit"
											disabled={isSubmitting}
											loading={isSubmitting}
										>
											Reject
										</Button>
									</div>
								</form>
							);
						}}
					</Formik>
				</Modal>
			</div>
		);
	}
}

export default ReasonToRejectUpgradeModal;
