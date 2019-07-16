import React, { Component } from "react";
import QRCode from "qrcode.react";
import { Modal } from "antd";

class ShowQRCode extends Component {
	render() {
		const { isModalVisible, hideModal, link } = this.props;
		return (
			<>
				<Modal
					visible={isModalVisible}
					onCancel={hideModal}
					onOk={hideModal}
					className="modal-qrcode"
				>
					<QRCode size={256} value={link} />
				</Modal>
			</>
		);
	}
}

export default ShowQRCode;
