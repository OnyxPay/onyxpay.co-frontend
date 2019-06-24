import React, { Component, useState, useEffect } from "react";
import { connect } from "react-redux";
import { Input, Select, Icon, Modal, message } from "antd";
import { getData as getCountriesData } from "country-list";
import { getTelegramBotLink } from "../../api/profile";
import StyledSelect from "./StyledSelect";
import StyledInput from "./StyledInput";

const { Option } = Select;

function getProfileForm(user, setVisible) {
	return (
		<form className="profile_editor_form">
			<div className="profile_editor_item">
				First name:
				<StyledInput value={user.firstName} />
			</div>
			<div className="profile_editor_item">
				Last name:
				<StyledInput value={user.lastName} />
			</div>
			<div className="profile_editor_item">
				Phone number:
				<Input
					value={user.phone}
					className="profile-editor-input"
					suffix={<Icon type="edit" style={{ color: "rgba(0,0,0,.45)" }} />}
					onChange={() => {
						setVisible(true);
					}}
				/>
			</div>
			<div className="profile_editor_item">
				Email:
				<StyledInput value={user.email} />
			</div>
			<div className="profile_editor_item">
				Country:
				<StyledSelect
					value={user.countryId}
					className="profile-editor-input"
					style={{ width: "100%" }}
					options={getCountriesData().map((country, index) => {
						return (
							<Option key={country.code} value={country.code}>
								{country.name}
							</Option>
						);
					})}
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
			message.error("There is the problem with opening telegram link.", 5);
		}
	);
}

function ProfileEditor(props) {
	const [visible, setVisible] = useState(false);
	return (
		<div>
			<h3>
				<b>User settings</b>
			</h3>
			{getProfileForm(props.user, setVisible)}
			<Modal
				title="Update phone number via Telegram bot"
				visible={visible}
				okText="Open Telegram"
				onOk={() => openTelegramLink()}
				onCancel={() => setVisible(false)}
			>
				<p>
					To change the phone number you should click "Open Telegram" button. And allow to receive
					your phone number by the Telegram bot. Your phone number will be updated automatically.
				</p>
			</Modal>
		</div>
	);
}

const mapStateToProps = function(state) {
	return {
		user: state.user,
	};
};

export default connect(mapStateToProps)(ProfileEditor);
