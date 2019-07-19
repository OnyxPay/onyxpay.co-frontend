import React, { useState } from "react";
import { Button, Modal } from "antd";
import styled from "styled-components";
import { deleteUserAccount } from "api/profile";

const DeleteAccountContainer = styled.div`
	margin-top: 15px;
`;

const { confirm } = Modal;

export default function DeleteAccount() {
	const [isLoadingDeleteAccount, toggleBtnLoading] = useState(false);
	const showMessage = () => {
		toggleBtnLoading(true);
		confirm({
			title: "Are you sure delete your accounts?",
			content:
				"After deleting an account,  you will lose access to all their assets, and to restore access, you will need to register a new account with the same wallet.",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			async onOk() {
				const res = await deleteUserAccount();
				if (res === "OK") {
				}
				toggleBtnLoading(false);
			},
			onCancel() {
				console.log("Cancel");
				toggleBtnLoading(false);
			},
		});
	};
	return (
		<DeleteAccountContainer>
			<Button
				type="danger"
				delete={isLoadingDeleteAccount}
				className="btn-delete-account"
				onClick={() => showMessage()}
			>
				Delete my user account
			</Button>
		</DeleteAccountContainer>
	);
}
