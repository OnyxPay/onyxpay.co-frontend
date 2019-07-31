import React from "react";
import { Modal, Table } from "antd";

const ShowUserData = props => {
	const { data, visible, hideModal } = props;
	const columns = [
		{
			title: "Country",
			dataIndex: "country",
			render: (text, record, index) => (record ? record : "n/a"),
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
			title: "Phone number",
			dataIndex: "phone_number",
			width: "10%",
			render: (text, record, index) => (record ? record : "n/a"),
		},
	];
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
				/>
			</Modal>
		</>
	);
};

export default ShowUserData;
