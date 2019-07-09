import { Modal, Table } from "antd";
import React, { Component } from "react";

class ShowUserData extends Component {
	render() {
		const { data, visible, hideModal } = this.props;
		const columns = [
			{
				title: "Country",
				dataIndex: "country",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Successful operations",
				dataIndex: "successful_operations",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Unsuccessful operations",
				dataIndex: "unsuccessful_operations",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Phone number",
				dataIndex: "phone_number",
				width: "10%",
				render: res => (res ? res : "n/a"),
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
	}
}

export default ShowUserData;
