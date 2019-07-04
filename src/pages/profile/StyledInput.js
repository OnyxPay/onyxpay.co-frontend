import React, { useState } from "react";
import { Input, Icon, Form } from "antd";

function getInputSuffix(disabled, setDisabled, onClickEdit, onChange, onCancel, isValid) {
	if (disabled) {
		return (
			<Icon
				type="edit"
				className="edit-icon"
				onClick={() => {
					onClickEdit();
				}}
			/>
		);
	} else {
		return (
			<>
				<Icon
					type="check"
					className="change-icon"
					onClick={() => {
						if (isValid()) {
							onChange();
							setDisabled(true);
						}
					}}
				/>
				<Icon
					type="close"
					className="reject-icon"
					onClick={() => {
						onCancel();
						setDisabled(true);
					}}
				/>
			</>
		);
	}
}

export default function StyledInput(props) {
	const [disabled, setDisabled] = useState(true);
	const [value, setValue] = useState(props.value);
	const [contentError, setContentError] = useState(undefined);
	let inputRef;
	return (
		<Form.Item validateStatus={contentError ? "error" : ""} help={contentError}>
			<Input
				defaultValue={props.value}
				value={value}
				className="profile-editor-input"
				ref={input => (inputRef = input)}
				onChange={event => {
					setDisabled(false);
					setValue(event.target.value);
					setContentError(undefined);
				}}
				suffix={getInputSuffix(
					disabled,
					setDisabled,
					() => inputRef.input.select(),
					() => props.updateValue(inputRef),
					() => {
						setValue(props.value);
						setContentError(undefined);
					},
					() => {
						const status = props.checkValue(inputRef);
						setContentError(status);
						return !status;
					}
				)}
			/>
		</Form.Item>
	);
}
