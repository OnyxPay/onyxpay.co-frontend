import React from "react";
import { Button, Icon, Input } from "antd";
import { get } from "lodash";

function handleSearch(selectedKeys, confirm, dataIndex) {
	confirm();
}

function handleReset(clearFilters, dataIndex) {
	clearFilters();
}

export function getColumnSearchProps() {
	let searchInput;
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
						onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
						style={{ width: 188, marginBottom: 8, display: "block" }}
					/>
					<Button
						type="primary"
						onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
						icon="search"
						size="small"
						style={{ width: 90, marginRight: 8 }}
					>
						Search
					</Button>
					<Button
						onClick={() => handleReset(clearFilters, dataIndex)}
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
			}
		},
	});
}

export function getOnColumnFilterProp(dataIndex) {
	// for client side filtration
	return {
		onFilter: (value, record) => {
			return get(record, dataIndex)
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase());
		},
	};
}
