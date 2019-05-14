import React, { Component } from "react";
import { Modal } from "antd";

class RegistrationModal extends Component {
	render() {
		const { isModalVisible, hideModal, openTestModal } = this.props;
		return (
			<Modal title="" visible={isModalVisible} onCancel={hideModal} footer={null}>
				<h1>hi!</h1>
			</Modal>
		);
	}
}

export default RegistrationModal;
