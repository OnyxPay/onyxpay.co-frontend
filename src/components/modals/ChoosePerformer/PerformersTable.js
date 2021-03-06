import React from "react";
import { Button, Tooltip, Table } from "antd";
import { getColumnSearchProps, getOnColumnFilterProp } from "components/table/common";
import { sortValues, trimAddress, getLocalTime } from "utils";

function PerformersTable({
	data,
	loading,
	selectedRowKeys,
	onSelectedRowKeysChange,
	pagination,
	onChange,
	isSendingMessage,
	showUserSettlementsModal,
	requestId,
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
				dataIndex: "createdAt",
				sorter: true,
				render: (text, record, index) => {
					return <span>{getLocalTime(record.createdAt)}</span>;
				},
			},
			{
				title: "Operations",
				children: [
					{
						title: "Successful",
						dataIndex: "count.operations_successful",
					},
					{
						title: "Unsuccessful",
						dataIndex: "count.operations_unsuccessful",
					},
				],
			},
			{
				title: "Wallet address",
				dataIndex: "walletAddr",
				render: (text, record, index) => {
					return record.walletAddr ? trimAddress(record.walletAddr, false) : "n/a";
				},
				...getColumnSearchProps()("walletAddr"),
			},
			{
				title: "Actions",
				render: (text, record, index) => {
					return record.is_settlements_exists && record.user_id ? (
						<Tooltip title="See settlement accounts">
							<Button
								shape="round"
								icon="account-book"
								onClick={e => showUserSettlementsModal(record.user_id)}
							/>
						</Tooltip>
					) : null;
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
				dataIndex: "createdAt",
				sorter: (a, b) => {
					const dateA = new Date(a.receiver.createdAt).getTime();
					const dateB = new Date(b.receiver.createdAt).getTime();
					return sortValues(dateA, dateB);
				},
				sortDirections: ["descend", "ascend"],
				render: (text, record, index) => {
					return <span>{getLocalTime(record.receiver.createdAt)}</span>;
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
					return record.receiver &&
						record.receiver.user_id &&
						record.receiver.is_settlements_exists ? (
						<Tooltip title="See settlement accounts">
							<Button
								shape="round"
								icon="account-book"
								onClick={e => showUserSettlementsModal(record.receiver.user_id)}
							/>
						</Tooltip>
					) : null;
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
