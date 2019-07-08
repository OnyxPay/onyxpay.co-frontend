import React from "react";
import { Table } from "antd";
import { getLocalTime } from "../../../utils";
import { Button, Tooltip } from "antd";

function AgentsTable({
	data,
	loading,
	selectedRowKeys,
	onSelectedRowKeysChange,
	pagination,
	onChange,
	isSendingMessage,
	showUserSettlementsModal,
}) {
	let columns = [];
	if (isSendingMessage) {
		columns = [
			{ title: "First name", dataIndex: "first_name" },
			{ title: "Last name", dataIndex: "last_name" },
			{
				title: "Registered",
				render: (text, record, index) => {
					return <span>{getLocalTime(record.created_at)}</span>;
				},
			},
			{ title: "Wallet address", dataIndex: "wallet_addr" },
			{
				title: "Actions",
				render: (text, record, index) => {
					return (
						<Tooltip title="See settlement accounts">
							<Button
								shape="round"
								icon="account-book"
								onClick={e => showUserSettlementsModal(record.user_id)}
							/>
						</Tooltip>
					);
				},
			},
		];
	} else {
		columns = [
			{
				title: "Name",
				render: (text, record, index) => {
					return <span>{record.receiver.first_name + " " + record.receiver.last_name}</span>;
				},
			},
			{
				title: "Registered",
				render: (text, record, index) => {
					return <span>{getLocalTime(record.receiver.created_at)}</span>;
				},
			},
			{ title: "Wallet address", dataIndex: "receiver.wallet_addr" },
			{
				title: "Actions",
				render: (text, record, index) => {
					return (
						<Tooltip title="See settlement accounts">
							<Button
								shape="round"
								icon="account-book"
								onClick={e => showUserSettlementsModal(record.receiver.user_id)}
							/>
						</Tooltip>
					);
				},
			},
		];
	}

	const rowSelection = {
		type: isSendingMessage ? "checkbox" : "radio",
		selectedRowKeys,
		onChange: onSelectedRowKeysChange,
	};

	return (
		<>
			<Table
				columns={columns}
				dataSource={isSendingMessage ? data && data.items : data}
				rowKey={record => (isSendingMessage ? record.user_id : record.id)}
				bordered
				pagination={isSendingMessage ? { ...pagination, size: "small" } : false}
				className="ovf-auto"
				loading={loading}
				rowSelection={rowSelection}
				onChange={onChange}
			/>
		</>
	);
}

export default AgentsTable;
