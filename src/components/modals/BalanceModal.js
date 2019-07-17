import React from "react";
import { Modal, Table, Typography } from "antd";
import { roles } from "../../api/constants";
const { Title, Text } = Typography;

function BalanceModal({ isModalVisible, hideModal, balance, role }) {
	const columns = [
		{ title: "Name", dataIndex: "symbol" },
		{ title: "Amount", dataIndex: "amount" },
		{ title: "Buy", dataIndex: "buy" },
		{ title: "Sell", dataIndex: "sell" },
		{
			title: role === roles.a || role === roles.sa ? "ONYXCASH" : "USD",
			dataIndex: "asset_converted",
		},
	];

	return (
		<Modal title="Detailed balance" visible={isModalVisible} onCancel={hideModal} footer={null}>
			{role === roles.a || role === roles.sa ? (
				<Title level={4}>ONYXCASH: {<Text>{balance.onyxCash}</Text>}</Title>
			) : null}

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
