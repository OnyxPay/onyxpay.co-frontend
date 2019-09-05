import React, { useState } from "react";
import { connect } from "react-redux";
import { Input, Select, Icon, Modal } from "antd";
import { getData as getCountriesData } from "country-list";
import { getTelegramBotLink, confirmEmail, changeProfile } from "../../api/profile";
import StyledSelect from "./StyledSelect";
import StyledInput from "./StyledInput";
import Actions from "../../redux/actions";
import { isEmailValid, isLatinChars } from "../../utils/validate";
import { showNotification } from "components/notification";

const { Option } = Select;

function updateProfile(data, getUserData) {
	changeProfile(data).then(
		data => {
			getUserData();
		},
		err => {
			showNotification({
				type: "error",
				msg: "There is error occured while user profile updating",
			});
		}
	);
}

function validateNameField(value) {
	if (!value) {
		return "Required field";
	} else if (value.length < 2) {
		return "min length 2";
	} else if (!isLatinChars(value)) {
		return "only Latin characters are accepted";
	}
}

function validateEmail(inputRef, prevEmail) {
	const newEmail = inputRef.state.value;
	if (!inputRef.state.value) {
		return "Required field";
	} else if (!isEmailValid(inputRef.state.value)) {
		return "Email is not valid";
	} else if (newEmail === prevEmail) {
		return "Email is not changed";
	}
}

function getProfileForm(user, setUpdatePhoneVisible, setConfirmEmailVisible, getUserData) {
	return (
		<form className="profile-editor-form">
			<div className="profile-editor-item">
				First name:
				<StyledInput
					value={user.firstName}
					updateValue={ref => updateProfile({ firstName: ref.state.value }, getUserData)}
					validateValue={ref => validateNameField(ref.state.value)}
				/>
			</div>
			<div className="profile-editor-item">
				Last name:
				<StyledInput
					value={user.lastName}
					updateValue={ref => updateProfile({ lastName: ref.state.value }, getUserData)}
					validateValue={ref => validateNameField(ref.state.value)}
				/>
			</div>
			<div className="profile-editor-item">
				Phone number:
				<Input
					value={user.phone}
					className="profile-editor-input"
					suffix={
						<Icon
							type="edit"
							style={{ color: "rgba(0,0,0,.45)" }}
							onClick={() => setUpdatePhoneVisible(true)}
						/>
					}
					onChange={() => setUpdatePhoneVisible(true)}
				/>
			</div>
			<div className="profile-editor-item">
				Email:
				<StyledInput
					value={user.email}
					updateValue={ref => {
						updateProfile({ email: ref.state.value }, getUserData);
						setConfirmEmailVisible(true);
					}}
					validateValue={ref => validateEmail(ref, user.email)}
				/>
			</div>
			<div className="profile-editor-item">
				Country:
				<StyledSelect
					defaultValue={user.countryId}
					className="profile-editor-input"
					options={getCountriesData().map((country, index) => {
						return (
							<Option key={country.code} value={country.code}>
								{country.name}
							</Option>
						);
					})}
					updateValue={value => updateProfile({ country: value }, getUserData)}
				/>
			</div>
		</form>
	);
}
function openTelegramLink() {
	getTelegramBotLink().then(
		data => {
			console.info(data);
			var win = window.open(data.data.url, "_blank");
			win.focus();
		},
		error => {
			console.error(error);
			showNotification({
				type: "error",
				msg: "There is the problem with opening telegram link",
			});
		}
	);
}

function ProfileEditor(props) {
	const [updatePhoneModalVisible, setUpdatePhoneModalVisible] = useState(false);
	const [confirmEmailVisible, setConfirmEmailVisible] = useState(false);
	let emailConfirmationInputRef;
	return (
		<div>
			<h3>
				<b>User settings</b>
			</h3>
			{getProfileForm(
				props.user,
				setUpdatePhoneModalVisible,
				setConfirmEmailVisible,
				props.getUserData
			)}
			<Modal
				title="Update phone number via Telegram bot"
				visible={updatePhoneModalVisible}
				okText="Open Telegram"
				onOk={() => {
					openTelegramLink();
					setUpdatePhoneModalVisible(false);
				}}
				onCancel={() => setUpdatePhoneModalVisible(false)}
			>
				<p>
					To change your phone number, please click Open Telegram button below. You need to login to
					Telegram with a phone number first. Then, please follow Telegram bot instructions.
				</p>
			</Modal>
			<Modal
				title="Confirm email change"
				visible={confirmEmailVisible}
				okText="Confirm"
				onOk={() => {
					confirmEmail({ token: emailConfirmationInputRef.state.value }).then(
						() => {
							showNotification({
								type: "success",
								msg: "Email address has been changed successfully",
							});
							props.getUserData();
						},
						err => {
							console.error(err.response.data.errors);

							let desc =
								err.response.data.errors.token === "Invalid confirmation token"
									? "Confirmation code is incorrect. Please try again"
									: `Details: ${err.response.data.errors.token}`;
							showNotification({
								type: "error",
								msg: "Update email error:",
								desc: desc,
							});
						}
					);
					setConfirmEmailVisible(false);
				}}
				onCancel={() => setConfirmEmailVisible(false)}
			>
				<p>Please check your email to verify the address and enter a confirmation code below.</p>
				<Input ref={input => (emailConfirmationInputRef = input)} />
			</Modal>
		</div>
	);
}

const mapStateToProps = function(state) {
	return {
		user: state.user,
	};
};

export default connect(
	mapStateToProps,
	{ getUserData: Actions.user.getUserData }
)(ProfileEditor);
