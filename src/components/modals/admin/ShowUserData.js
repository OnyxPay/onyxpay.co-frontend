import { Modal, Table } from "antd";
import React, { Component } from "react";

class ShowUserData extends Component {
	state = {
		loading: false,
	};

	componentDidMount = async () => {};

	render() {
		console.log(this.props);
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
					visible={this.props.visible}
					onOk={() => this.props.hideModal(false)}
					onCancel={() => this.props.hideModal(false)}
					className="large-modal"
				>
					<Table
						columns={columns}
						rowKey={data => data.id}
						dataSource={this.props.data}
						className="ovf-auto"
						pagination={false}
						loading={this.state.loading}
					/>
				</Modal>
			</>
		);
	}
}

export default ShowUserData;
