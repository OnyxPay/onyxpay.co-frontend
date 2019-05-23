import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Alert } from "antd";
import Actions from "../../redux/actions";

class SessionExpiredModal extends Component {
	render() {
		const { isModalVisible, user, logOut } = this.props;

		return (
			<Modal
				title=""
				visible={isModalVisible && user}
				closable={false}
				destroyOnClose={true}
				zIndex={1001}
				cancelButtonProps={{ style: { display: "none" } }}
				onOk={() => {
					logOut();
				}}
			>
				<Alert
					message="Your session is expired, you will be logged out..."
					type="info"
					showIcon
					banner
				/>
			</Modal>
		);
	}
}

export default connect(
	state => {
		return {
			isModalVisible: state.session.isModalVisible,
			user: state.user,
		};
	},
	{
		logOut: Actions.auth.logOut,
	}
)(SessionExpiredModal);
