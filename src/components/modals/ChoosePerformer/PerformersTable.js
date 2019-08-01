import React from "react";
import { getLocalTime } from "../../../utils";
import { Button, Tooltip, Table } from "antd";
import { getColumnSearchProps, getOnColumnFilterProp } from "components/table/common";
import { sortValues } from "utils";

function PerformersTable({
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
			{
				title: "First name",
				dataIndex: "first_name",
				sorter: true,
				width: 160,
				...getColumnSearchProps()("first_name"),
			},
			{
				title: "Last name",
				dataIndex: "last_name",
				sorter: true,
				width: 160,
				...getColumnSearchProps()("last_name"),
			},
			{
				title: "Registered",
				dataIndex: "created_at",
				sorter: true,
				render: (text, record, index) => {
					return <span>{getLocalTime(record.created_at)}</span>;
				},
			},
			{
				title: "Wallet address",
				dataIndex: "wallet_addr",
				...getColumnSearchProps()("wallet_addr"),
			},
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
				title: "First name",
				dataIndex: "receiver.first_name",
				sorter: (a, b) => {
					const nameA = a.receiver.first_name.toLowerCase();
					const nameB = b.receiver.first_name.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["descend", "ascend"],
				...getColumnSearchProps()("first_name"),
				...getOnColumnFilterProp("receiver.first_name"),
			},
			{
				title: "Last name",
				dataIndex: "receiver.last_name",
				sorter: (a, b) => {
					const nameA = a.receiver.last_name.toLowerCase();
					const nameB = b.receiver.last_name.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["descend", "ascend"],
				...getColumnSearchProps()("last_name"),
				...getOnColumnFilterProp("receiver.last_name"),
			},
			{
				title: "Registered",
				dataIndex: "created_at",
				sorter: (a, b) => {
					const dateA = new Date(a.receiver.created_at).getTime();
					const dateB = new Date(b.receiver.created_at).getTime();
					return sortValues(dateA, dateB);
				},
				sortDirections: ["descend", "ascend"],
				render: (text, record, index) => {
					return <span>{getLocalTime(record.receiver.created_at)}</span>;
				},
			},
			{
				title: "Wallet address",
				dataIndex: "receiver.wallet_addr",
				...getColumnSearchProps()("wallet_addr"),
				...getOnColumnFilterProp("receiver.wallet_addr"),
			},
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
				onChange={isSendingMessage ? onChange : null} // server or local sorting
			/>
		</>
	);
}

export default PerformersTable;
