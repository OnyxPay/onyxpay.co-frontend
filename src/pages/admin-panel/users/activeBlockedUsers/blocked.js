import React, { Component } from "react";
import { Table } from "antd";

const data = [
	{
		key: "1",
		name: "John Brown",
		age: 32,
		address: "New York No. 1 Lake Park",
	},
	{
		key: "2",
		name: "Jim Green",
		age: 42,
		address: "London No. 1 Lake Park",
	},
	{
		key: "3",
		name: "Joe Black",
		age: 32,
		address: "Sidney No. 1 Lake Park",
	},
];

const columns = [
	{
		title: "Name",
		dataIndex: "name",
	},
	{
		title: "Age",
		dataIndex: "age",
	},
	{
		title: "Address",
		dataIndex: "address",
	},
];

class BlockedUsers extends Component {
	render() {
		return <Table columns={columns} dataSource={data} size="middle" />;
	}
}

export default BlockedUsers;
