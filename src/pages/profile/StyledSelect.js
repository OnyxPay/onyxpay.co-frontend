import React, { useState } from "react";
import { Select, Icon } from "antd";

function getInputSuffix(disabled, onCancel, onChange) {
	if (disabled) {
		return;
	} else {
		return (
			<>
				<Icon
					type="check"
					className="change-icon"
					onClick={event => {
						onChange();
						event.stopPropagation();
					}}
				/>
				<Icon
					type="close"
					className="reject-icon"
					onClick={event => {
						onCancel();
						event.stopPropagation();
					}}
				/>
			</>
		);
	}
}
export default function StyledSelect(props) {
	const [disabled, setDisabled] = useState(true);
	const [value, setValue] = useState(props.defaultValue);
	let inputRef;

	return (
		<Select
			defaultValue={props.defaultValue}
			value={value}
			className="profile-editor-input"
			ref={input => (inputRef = input)}
			onChange={val => {
				setValue(val);
				setDisabled(false);
			}}
			suffixIcon={getInputSuffix(
				disabled,
				() => {
					setDisabled(true);
					setValue(props.defaultValue);
				},
				() => {
					props.updateValue(value, inputRef);
					setDisabled(true);
				}
			)}
		>
			{props.options}
		</Select>
	);
}
