import React, { useState } from "react";
import { connect } from "react-redux";
import { Button, Modal } from "antd";
import styled from "styled-components";
import { deleteUserAccount } from "api/profile";
import Actions from "redux/actions";
import { showNotification } from "components/notification";

const DeleteAccountContainer = styled.div`
	margin-top: 15px;
`;

const { confirm } = Modal;

function DeleteAccount(props) {
	const [isLoadingDeleteAccount, toggleBtnLoading] = useState(false);
	const { logOut } = props;
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
				if (res.data === "OK") {
					await logOut();
					showNotification({
						type: "success",
						msg: "Your account was successfully deleted",
					});
				}
				toggleBtnLoading(false);
			},
			onCancel() {
				toggleBtnLoading(false);
			},
		});
	};
	return (
		<DeleteAccountContainer>
			<Button
				type="danger"
				loading={isLoadingDeleteAccount}
				className="btn-delete-account"
				onClick={() => showMessage()}
			>
				Delete my user account
			</Button>
		</DeleteAccountContainer>
	);
}

export default connect(
	null,
	{
		logOut: Actions.auth.logOut,
	}
)(DeleteAccount);
