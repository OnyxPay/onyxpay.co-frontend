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
				dataIndex: "firstName",
				sorter: true,
				width: 160,
				...getColumnSearchProps()("firstName"),
			},
			{
				title: "Last name",
				dataIndex: "lastName",
				sorter: true,
				width: 160,
				...getColumnSearchProps()("lastName"),
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
				dataIndex: "walletAddr",
				...getColumnSearchProps()("walletAddr"),
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
				dataIndex: "receiver.firstName",
				sorter: (a, b) => {
					const nameA = a.receiver.firstName.toLowerCase();
					const nameB = b.receiver.firstName.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["descend", "ascend"],
				...getColumnSearchProps()("firstName"),
				...getOnColumnFilterProp("receiver.firstName"),
			},
			{
				title: "Last name",
				dataIndex: "receiver.lastName",
				sorter: (a, b) => {
					const nameA = a.receiver.lastName.toLowerCase();
					const nameB = b.receiver.lastName.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["descend", "ascend"],
				...getColumnSearchProps()("lastName"),
				...getOnColumnFilterProp("receiver.lastName"),
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
				dataIndex: "receiver.walletAddr",
				...getColumnSearchProps()("walletAddr"),
				...getOnColumnFilterProp("receiver.walletAddr"),
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
