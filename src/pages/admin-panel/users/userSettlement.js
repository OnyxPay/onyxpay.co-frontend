import { Modal, Table } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../../redux/actions";

class UserSettlement extends Component {
	state = {
		data: [],
		loading: false,
	};

	componentDidMount = async () => {
		this.setState({
			loading: true,
		});
		const { getUserSetElementData } = this.props;
		await getUserSetElementData(this.props.userId);
		const { userSettlement } = this.props;
		this.setState({
			data: userSettlement,
			loading: false,
		});
	};

	render() {
		const { data } = this.state;
		const columns = [
			{
				title: "account_name",
				dataIndex: "account_name",
				key: "account_name",
				width: "10%",
			},
			{
				title: "account_number",
				dataIndex: "account_number",
				key: "account_number",
				width: "10%",
			},
			{
				title: "brief_notes",
				dataIndex: "brief_notes",
				key: "brief_notes",
				width: "10%",
			},
			{
				title: "description",
				dataIndex: "description",
				key: "description",
				width: "10%",
			},
			{
				title: "updated_at",
				dataIndex: "updated_at",
				key: "updated_at",
				width: "10%",
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
						dataSource={data}
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
		getUserSetElementData: Actions.userSettlementAccountData.getUserSettlementData,
	}
)(UserSettlement);
