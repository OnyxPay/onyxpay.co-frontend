import React, { Component } from "react";
import { Modal, Table } from "antd";
import { getSettlementsByUserId } from "api/settlement-accounts";

class UserSettlement extends Component {
	state = {
		loading: false,
		data: [],
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.userId !== this.props.userId) {
			this.fetchData(this.props.userId);
		}
	}

	async fetchData(userId) {
		this.setState({ loading: true });
		try {
			const data = await getSettlementsByUserId(userId);
			this.setState({ loading: false, data: data.items });
		} catch (e) {
		} finally {
			this.setState({ loading: false });
		}
	}

	render() {
		const { loading, data } = this.state;
		const columns = [
			{
				title: "Account name",
				dataIndex: "account_name",
				key: "account_name",
				width: "10%",
			},
			{
				title: "Account number",
				dataIndex: "account_number",
				key: "account_number",
				width: "10%",
			},
			{
				title: "Brief notes",
				dataIndex: "brief_notes",
				key: "brief_notes",
				width: "10%",
			},
			{
				title: "Description",
				dataIndex: "description",
				key: "description",
				width: "10%",
			},
			{
				title: "Updated",
				dataIndex: "updated_at",
				key: "updated_at",
				width: "10%",
				render: res => new Date(res).toLocaleString(),
			},
		];
		return (
			<>
				<Modal
					title="Settlement accounts"
					visible={this.props.isModalVisible}
					onOk={() => this.props.hideModal(false)}
					onCancel={() => this.props.hideModal(false)}
					className="large-modal"
				>
					<Table
						columns={columns}
						rowKey={data => data.id}
						dataSource={data}
						className="ovf-auto"
						pagination={false}
						loading={loading}
					/>
				</Modal>
			</>
		);
	}
}

export default UserSettlement;
