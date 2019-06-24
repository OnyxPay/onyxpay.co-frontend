import React, { Component } from "react";
import { connect } from "react-redux";
import { Input, Select } from "antd";
import { getData as getCountriesData } from "country-list";
const { Option } = Select;

function getProfileForm(user) {
	return (
		<form className="profile_editor_form">
			<p>
				First name:
				<Input value={user.firstName} className="profile-editor-input" />
			</p>
			<p>
				Last name:
				<Input value={user.lastName} className="profile-editor-input" />
			</p>

			<p>
				Country:
				<Select value={user.country} className="profile-editor-input">
					{getCountriesData().map((country, index) => {
						return (
							<Option key={country.code} value={country.code}>
								{country.name}
							</Option>
						);
					})}
				</Select>
			</p>
			<p>
				Phone number:
				<Input value={user.phone} className="profile-editor-input" />
			</p>
		</form>
	);
}

function ProfileEditor(props) {
	return (
		<div>
			<h3>
				<b>User settings</b>
			</h3>
			{getProfileForm(props.user)}
		</div>
	);
}

const mapStateToProps = function(state) {
	return {
		user: state.user,
	};
};

export default connect(mapStateToProps)(ProfileEditor);
