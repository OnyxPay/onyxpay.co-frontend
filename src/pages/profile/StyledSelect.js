import React, { useState } from "react";
import { Select, Icon } from "antd";

function getInputSuffix(disabled, setDisabled, onChenge) {
	if (disabled) {
		return;
	} else {
		return (
			<>
				<Icon
					type="check"
					className="change-icon"
					onClick={() => {
						onChenge();
					}}
				/>
				<Icon
					type="close"
					className="reject-icon"
					onClick={event => {
						setDisabled(true);
						event.stopPropagation();
					}}
				/>
			</>
		);
	}
}
export default function StyledSelect(props) {
	const [disabled, setDisabled] = useState(true);
	let inputRef;

	return (
		<Select
			defaultValue={props.value}
			className="profile-editor-input"
			ref={input => (inputRef = input)}
			onChange={() => {
				setDisabled(false);
			}}
			suffixIcon={getInputSuffix(disabled, setDisabled, () => {
				props.updateValue();
			})}
		>
			{props.options}
		</Select>
	);
}
