import React from "react";
import { Modal, Table } from "antd";
import { getName as getCountryName } from "country-list";

const ShowUserData = props => {
	const { data, visible, hideModal, selectedUserDataType } = props;
	let columns;

	if (selectedUserDataType === "performer") {
		columns = [
			{
				title: "Country",
				dataIndex: "country",
				render: (text, record) => (record ? getCountryName(record.country) : "n/a"),
			},
			{
				title: "Operations",
				children: [
					{
						title: "Successful",
						dataIndex: "successful_operations",
					},
					{
						title: "Unsuccessful",
						dataIndex: "unsuccessful_operations",
					},
				],
			},
			{
				title: "Phone",
				dataIndex: "phoneNumber",
				width: "10%",
				render: (text, record) => (record && record.phoneNumber ? record.phoneNumber : "n/a"),
			},
			{
				title: "Email",
				dataIndex: "email",
				width: "10%",
				render: (text, record) => (record && record.email ? record.email : "n/a"),
			},
		];
	} else {
		columns = [
			{
				title: "Country",
				dataIndex: "country",
				render: (text, record) => (record ? getCountryName(record.country) : "n/a"),
			},
			{
				title: "Phone",
				dataIndex: "phoneNumber",
				render: (text, record) => (record && record.phoneNumber ? record.phoneNumber : "n/a"),
			},
			{
				title: "Email",
				dataIndex: "email",
				render: (text, record) => (record && record.email ? record.email : "n/a"),
			},
		];
	}

	return (
		<>
			<Modal
				title="User data"
				visible={visible}
				onOk={() => hideModal(false)}
				onCancel={() => hideModal(false)}
				className="large-modal"
			>
				<Table
					columns={columns}
					rowKey={data => data.id}
					dataSource={data}
					className="ovf-auto"
					pagination={false}
					bordered={true}
				/>
			</Modal>
		</>
	);
};

export default ShowUserData;
