import { Modal, Table } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import { getUserSettlementData } from "../../../redux/admin-panel/users";

class UserSettlement extends Component {
	state = {
		loading: false,
	};

	componentDidMount = async () => {
		this.setState({
			loading: true,
		});
		const { getUserSettlementData } = this.props;
		await getUserSettlementData(this.props.userId);
		const { userSettlement } = this.props;
		this.setState({
			data: userSettlement,
			loading: false,
		});
	};

	render() {
		const { userSettlement } = this.props;
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
					title="Settlement"
					visible={this.props.visible}
					onOk={() => this.props.hideModal(false)}
					onCancel={() => this.props.hideModal(false)}
					className="large-modal"
				>
					<Table
						columns={columns}
						rowKey={data => data.id}
						dataSource={userSettlement}
						className="ovf-auto"
						pagination={false}
						loading={this.state.loading}
					/>
				</Modal>
			</>
		);
	}
}

const mapStateToProps = state => ({
	userSettlement: state.userSettlement,
});

export default connect(
	mapStateToProps,
	{
		getUserSettlementData,
	}
)(UserSettlement);
