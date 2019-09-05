import React, { Component } from "react";
import { connect } from "react-redux";
import { Formik } from "formik";
import { Modal, Button, Form, Input } from "antd";
import { isEmailValid } from "../../utils/validate";
import Actions from "../../redux/actions";

class ConfirmEmailModal extends Component {
	state = {
		viewIndex: 0,
		loading: false,
	};

	componentDidMount() {
		this.checkUserStatus();
	}

	handleFormSubmit = async (values, formActions) => {
		const { confirmEmail } = this.props;
		const res = await confirmEmail(values);
		if (res && res.error) {
			if (res.error.status === 422 && res.error.data) {
				formActions.setErrors(res.error.data);
			}
		} else {
			this.changeView(1)();
		}
		formActions.setSubmitting(false);
	};

	checkUserStatus = async () => {
		const { getUserData, hideModal, startLoading } = this.props;
		startLoading();
		const res = await getUserData();
		if (res && !res.error) {
			if (res.user.status === 1) {
				hideModal();
				// enable dashboard
			} else if (res.user.email !== null) {
				this.changeView(1)();
			}
		}
	};

	changeView = index => () => {
		this.setState({ viewIndex: index });
	};

	handleLogout = () => {
		const { logOut } = this.props;
		this.setState({ loading: true });
		logOut();
	};

	render() {
		const { isModalVisible } = this.props;
		const { viewIndex, loading } = this.state;
		if (this.props.user.status === 1) {
			this.props.hideModal();
		}
		return (
			<Modal
				title=""
				visible={isModalVisible}
				footer={null}
				closable={false}
				destroyOnClose={true}
				className="confirm-email-modal"
			>
				{viewIndex === 0 && (
					<div>
						<h1>You are almost there!</h1>
						<p>
							Your account has successfully been created, to finish the registration process you
							need to confirm your email
						</p>
						<Formik
							onSubmit={this.handleFormSubmit}
							initialValues={{ email: "" }}
							validate={values => {
								let errors = {};
								if (!values.email) {
									errors.email = "Required field";
								} else if (!isEmailValid(values.email)) {
									errors.email = "Enter valid email";
								}
								return errors;
							}}
						>
							{({
								values,
								errors,
								touched,
								isSubmitting,
								handleChange,
								handleBlur,
								handleSubmit,
								...rest
							}) => {
								return (
									<form onSubmit={handleSubmit}>
										<Form.Item
											validateStatus={errors.email && touched.email ? "error" : ""}
											help={errors.email && touched.email ? errors.email : ""}
										>
											<Input
												placeholder="Please, enter your email address"
												name="email"
												type="email"
												value={values.email}
												onChange={handleChange}
												onBlur={handleBlur}
												disabled={isSubmitting}
											/>
										</Form.Item>

										<div className="ant-modal-custom-footer">
											<Button
												key="back"
												onClick={this.handleLogout}
												style={{ marginRight: 10 }}
												disabled={isSubmitting || loading}
												loading={loading}
											>
												Logout
											</Button>
											<Button
												type="primary"
												htmlType="submit"
												disabled={isSubmitting || loading}
												loading={isSubmitting}
											>
												Confirm Email
											</Button>
										</div>
									</form>
								);
							}}
						</Formik>
					</div>
				)}

				{viewIndex === 1 && (
					<div>
						<h1>You are almost there!</h1>
						<p>Now, please, check your email and follow the instructions</p>
						<div className="ant-modal-custom-footer">
							<Button
								key="back"
								onClick={this.handleLogout}
								style={{ marginRight: 10 }}
								disabled={loading}
								loading={loading}
							>
								Logout
							</Button>
							<Button onClick={this.changeView(0)} disabled={loading} style={{ marginRight: 10 }}>
								Back
							</Button>
						</div>
					</div>
				)}
			</Modal>
		);
	}
}
const mapStateToProps = function(state) {
	return {
		user: state.user,
	};
};
export default connect(
	mapStateToProps,
	{
		confirmEmail: Actions.auth.confirmEmail,
		getUserData: Actions.user.getUserData,
		logOut: Actions.auth.logOut,
		startLoading: Actions.loading.startLoading,
	}
)(ConfirmEmailModal);
