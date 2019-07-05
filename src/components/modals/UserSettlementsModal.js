import { Modal, Table } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../redux/actions";

// TODO: extract loading to separate reducer
// get data by id
class UserSettlement extends Component {
	state = {
		loading: false,
	};

	componentDidMount = async () => {
		const { getUserSettlements } = this.props;
		getUserSettlements(this.props.userId);
	};

	render() {
		const { userSettlements, loading } = this.props;
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
						dataSource={userSettlements}
						className="ovf-auto"
						pagination={false}
						loading={loading}
					/>
				</Modal>
			</>
		);
	}
}

const mapStateToProps = state => ({
	userSettlements: state.settlements,
	loading: state.loading,
});

export default connect(
	mapStateToProps,
	{
		getUserSettlements: Actions.settlements.getSettlementsList,
	}
)(UserSettlement);
