import React, { useState } from "react";
import { connect } from "react-redux";
import { Table } from "antd";
import { getLocalTime } from "../../../utils";
import { Button, Tooltip, Table } from "antd";
import { getColumnSearchProps, getOnColumnFilterProp } from "components/table/common";
import { sortValues } from "utils";

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
	if (request && data && request.operationMessages.length && isSendingMessage) {
		data.items = data.items.filter(el =>
			request.operationMessages.find(item => el.walletAddr !== item.receiver.walletAddr)
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
