import React from "react";
import QRCode from "qrcode.react";
import { Modal } from "antd";

export default function ShowQRCode(props) {
	const { isModalVisible, hideModal, link } = props;
	return (
		<>
			<Modal
				visible={isModalVisible}
				onCancel={hideModal}
				s
				onOk={hideModal}
				className="modal-qrcode"
			>
				<QRCode size={256} value={link} />
			</Modal>
		</>
	);
}
