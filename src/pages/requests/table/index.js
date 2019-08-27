import React from "react";
import { Input, Button, Icon, Popconfirm } from "antd";
import { requestStatus, operationMessageStatus } from "api/constants";
import { h24Mc } from "api/constants";
import { convertAmountToStr } from "utils/number";

export function handleTableChange({ fetchData, paginationState, setState }) {
	return function(pagination, filters, sorter) {
		setState(
			{
				pagination: {
					...paginationState,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				for (const filter in filters) {
					filters[filter] = filters[filter][0];
				}
				fetchData({
					...filters,
				});
			}
		);
	};
}

function handleSearch(selectedKeys, confirm, dataIndex, setState) {
	confirm();
	if (dataIndex === "id") {
		setTimeout(() => {
			setState({ idParsedFromURL: selectedKeys[0] });
		}, 0);
	}
}

function handleReset(clearFilters, dataIndex, setState) {
	clearFilters();
	if (dataIndex === "id") {
		setTimeout(() => {
			setState({ idParsedFromURL: "" });
		}, 0);
	}
}

export function getColumnSearchProps(setState, searchInput) {
	return dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
			return (
				<div style={{ padding: 8 }}>
					<Input
						ref={node => {
							searchInput = node;
						}}
						placeholder={`Search ${dataIndex}`}
						value={selectedKeys[0]}
						onChange={e => {
							return setSelectedKeys(e.target.value ? [e.target.value] : []);
						}}
						onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex, setState)}
						style={{ width: 188, marginBottom: 8, display: "block" }}
					/>
					<Button
						type="primary"
						onClick={() => handleSearch(selectedKeys, confirm, dataIndex, setState)}
						icon="search"
						size="small"
						style={{ width: 90, marginRight: 8 }}
					>
						Search
					</Button>
					<Button
						onClick={() => handleReset(clearFilters, dataIndex, setState)}
						size="small"
						style={{ width: 90 }}
					>
						Reset
					</Button>
				</div>
			);
		},

		filterIcon: filtered => (
			<Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
		),

		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => searchInput.select());
			} else {
				if (searchInput) {
					setTimeout(() => {
						setState({ idParsedFromURL: searchInput.props.value });
					}, 0);
				}
			}
		},
	});
}

export function isTimeUp(startDate, intervalMc) {
	const now = new Date().getTime();
	return new Date(startDate).getTime() + intervalMc < now;
}

export function renderPerformBtn(
	record,
	performRequest,
	walletAddress,
	requestsType,
	isPerformActive,
	isPerformerAgent
) {
	let btn;

	function getButton(requestId) {
		let btnText;
		let confirmText;
		if (requestsType === "deposit") {
			btnText = "Perform Deposit";
			confirmText = `Are you sure you want to deposit ${convertAmountToStr(
				record.request.amount,
				8
			)} ${record.request.asset} into ${record.sender.firstName} ${
				record.sender.lastName
			}'s customer account?`;
		} else if (requestsType === "buy_onyx_cash") {
			btnText = "Perform Deposit";
			confirmText = `Are you sure you want to deposit ${convertAmountToStr(
				record.request.amount,
				8
			)} ${record.request.asset} into ${record.sender.firstName} ${
				record.sender.lastName
			}'s Agent/Super agent account?`;
		} else {
			btnText = "Perform Withdraw";
			if (isPerformerAgent) {
				confirmText = "Are you sure you want to perform the withdrawal request?";
			} else {
				confirmText = `Please, confirm you have received ${convertAmountToStr(
					record.amount,
					8
				)} fiat ${record.asset} from ${record.taker.firstName} ${
					record.taker.lastName
				}'s Agent account`;
			}
		}

		if (isPerformActive) {
			return (
				<Button type="primary" loading={true} disabled={true}>
					{btnText}
				</Button>
			);
		} else {
			return (
				<Popconfirm title={confirmText} onConfirm={() => performRequest(requestId)}>
					<Button type="primary">{btnText}</Button>
				</Popconfirm>
			);
		}
	}

	if (requestsType === "withdraw") {
		if (record.statusCode === requestStatus.choose && record.takerAddr && record.taker) {
			// for initiator
			btn = getButton(record.requestId);
		} else if (
			record.statusCode === operationMessageStatus.accepted &&
			record.request &&
			record.request.takerAddr === walletAddress &&
			isTimeUp(record.request.chooseTimestamp, h24Mc)
		) {
			// for performer
			btn = getButton(record.request.requestId);
		} else {
			btn = null;
		}
	} else {
		if (
			record.request &&
			record.request.takerAddr === walletAddress &&
			record.request.statusCode !== requestStatus.completed &&
			record.request.statusCode !== requestStatus.complained
		) {
			btn = getButton(record.request.requestId);
		} else {
			btn = null;
		}
	}

	return btn;
}
