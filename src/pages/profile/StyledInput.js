import React, { useState } from "react";
import { Input, Icon } from "antd";

function getInputSuffix(disabled, setDisabled, onChange, onCancel) {
	if (disabled) {
		return (
			<Icon
				type="edit"
				className="edit-icon"
				onClick={() => {
					setDisabled(false);
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
						onChange();
						setDisabled(true);
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
	let inputRef;

	return (
		<Input
			defaultValue={props.value}
			value={value}
			className="profile-editor-input"
			ref={input => (inputRef = input)}
			onChange={event => {
				setDisabled(false);
				setValue(event.target.value);
			}}
			suffix={getInputSuffix(
				disabled,
				setDisabled,
				() => props.updateValue(inputRef),
				() => setValue(props.value)
			)}
		/>
	);
}
