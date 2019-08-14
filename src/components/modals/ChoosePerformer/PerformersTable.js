import React, { useState } from "react";
import { connect } from "react-redux";
import { Table } from "antd";
import { getLocalTime } from "../../../utils";
import { Button, Tooltip } from "antd";

function sortValues(valA, valB) {
	if (valA < valB) {
		return -1;
	}
	if (valA > valB) {
		return 1;
	}
	return 0;
}

function PerformersTable({
	opRequests,
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
			{ title: "First name", dataIndex: "first_name", sorter: true },
			{ title: "Last name", dataIndex: "last_name", sorter: true },
			{
				title: "Registered",
				dataIndex: "created_at",
				sorter: true,
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
				title: "First name",
				dataIndex: "receiver.first_name",
				sorter: (a, b) => {
					const nameA = a.receiver.first_name.toLowerCase();
					const nameB = b.receiver.first_name.toLowerCase();
					return sortValues(nameA, nameB);
				},
				sortDirections: ["descend", "ascend"],
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
	let request = opRequests.items.find(el => el.id === requestId);
	// remove agents received message from the list
	if (request && data && isSendingMessage) {
		data.items = data.items.filter(el =>
			request.operation_messages.find(item => el.wallet_addr !== item.receiver.wallet_addr)
		);
	}

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

function mapStateToProps(state, ownProps) {
	return {
		opRequests: state.opRequests,
	};
}

export default connect(mapStateToProps)(PerformersTable);
