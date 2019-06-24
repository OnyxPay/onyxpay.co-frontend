import React, { useState, useEffect } from "react";
import { Input, Icon } from "antd";

function getInputSuffix(disabled, setDisabled, onChenge) {
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
						onChenge();
					}}
				/>
				<Icon
					type="close"
					className="reject-icon"
					onClick={() => {
						setDisabled(true);
					}}
				/>
			</>
		);
	}
}

export default function StyledInput(props) {
	const [disabled, setDisabled] = useState(true);
	let inputRef;

	useEffect(() => {
		if (!disabled) {
			inputRef.input.select();
		}
	});

	return (
		<Input
			value={props.value}
			className="profile-editor-input"
			ref={input => (inputRef = input)}
			onClick={() => {
				setDisabled(false);
			}}
			suffix={getInputSuffix(disabled, setDisabled, () => {
				props.updateValue();
			})}
		/>
	);
}
