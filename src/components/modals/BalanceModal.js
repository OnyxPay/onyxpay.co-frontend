import React from "react";
import { Modal, Table, Typography } from "antd";
import { roles } from "../../api/constants";
const { Title, Text } = Typography;

function BalanceModal({ isModalVisible, hideModal, balance, role }) {
	let columns = [];
	if (role === roles.c) {
		columns = [
			{ title: "Asset", dataIndex: "symbol" },
			{ title: "Amount", dataIndex: "amount" },
			{ title: "USD equivalent", dataIndex: "asset_converted" },
		];
	} else {
		columns = [
			{ title: "Asset", dataIndex: "symbol" },
			{ title: "Amount", dataIndex: "amount" },
			{ title: "Buy", dataIndex: "buy" },
			{ title: "Sell", dataIndex: "sell" },
			{ title: "OnyxCash equivalent", dataIndex: "asset_converted" },
		];
	}

	return (
		<Modal
			title="Detailed balance"
			visible={isModalVisible}
			onCancel={hideModal}
			footer={null}
			className="detailed-balance-modal"
		>
			{(role === roles.a || role === roles.sa) && (
				<Title level={4}>
					ONYXCASH: <Text>{balance.onyxCash}</Text>
				</Title>
			)}

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
