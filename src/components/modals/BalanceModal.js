import React from "react";
import { Modal, Table, Typography } from "antd";
import { decodeAmount } from "../../utils/number";
const { Title, Text } = Typography;
const columns = [{ title: "Name", dataIndex: "name" }, { title: "Amount", dataIndex: "amount" }];

function BalanceModal({ isModalVisible, hideModal, balance }) {
	const assets = balance.assets.map(asset => {
		return { amount: decodeAmount(asset.amount, 8), name: asset.name, key: asset.key };
	});

	return (
		<Modal title="Detailed balance" visible={isModalVisible} onCancel={hideModal} footer={null}>
			<Title level={3}>OnyxCash: {<Text underline>{balance.onyxCash}</Text>}</Title>

			<Title level={3}>Assets:</Title>
			<Table columns={columns} dataSource={assets} bordered pagination={false} />
		</Modal>
	);
}

export default BalanceModal;
