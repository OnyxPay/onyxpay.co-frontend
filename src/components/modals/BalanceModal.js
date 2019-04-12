import React from "react";
import { Modal, Table, Typography } from "antd";
const { Title, Text } = Typography;

const columns = [
	{ title: "Name", dataIndex: "symbol" },
	{ title: "Amount", dataIndex: "amount" },
	{ title: "Buy", dataIndex: "buy" },
	{ title: "Sell", dataIndex: "sell" },
	{ title: "OnyxCash", dataIndex: "onyxCash" },
];

function BalanceModal({ isModalVisible, hideModal, balance }) {
	return (
		<Modal title="Detailed balance" visible={isModalVisible} onCancel={hideModal} footer={null}>
			<Title level={4}>OnyxCash: {<Text>{balance.onyxCash}</Text>}</Title>

			<Title level={4}>Assets:</Title>
			<Table
				columns={columns}
				dataSource={balance.assets}
				bordered
				pagination={false}
				className="ovf-auto"
			/>
		</Modal>
	);
}

export default BalanceModal;
