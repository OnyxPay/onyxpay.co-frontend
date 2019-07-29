import React from "react";
import { Input, Button, Icon, Popconfirm } from "antd";
import { requestStatus, operationMessageStatus } from "api/constants";
import { styles } from "../styles";
import { h24Mc } from "api/constants";

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
	isPerformActive
) {
	let btn;

	function getButton(requestId) {
		if (isPerformActive) {
			return (
				<Button type="primary" style={styles.btn} loading={true} disabled={true}>
					Perform
				</Button>
			);
		} else {
			return (
				<Popconfirm title="Sure to perform?" onConfirm={() => performRequest(requestId)}>
					<Button type="primary" style={styles.btn}>
						Perform
					</Button>
				</Popconfirm>
			);
		}
	}

	if (requestsType === "withdraw") {
		if (record.status_code === requestStatus.choose && record.taker_addr && record.taker) {
			// for initiator
			btn = getButton(record.request_id);
		} else if (
			record.status_code === operationMessageStatus.accepted &&
			record.request &&
			record.request.taker_addr === walletAddress &&
			isTimeUp(record.request.choose_timestamp, h24Mc)
		) {
			// for performer
			btn = getButton(record.request.request_id);
		} else {
			btn = null;
		}
	} else {
		if (
			record.request &&
			record.request.taker_addr === walletAddress &&
			record.request.status_code !== requestStatus.completed &&
			record.request.status_code !== requestStatus.complained &&
			!isTimeUp(record.request.choose_timestamp, h24Mc)
		) {
			btn = getButton(record.request.request_id);
		} else {
			btn = null;
		}
	}

	return btn;
}
