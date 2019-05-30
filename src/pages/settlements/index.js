import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Popconfirm, Table, Icon } from "antd";
import { PageTitle } from "../../components";
import AddSettlementModal from "../../components/modals/AddSettlementModal";
import Actions from "../../redux/actions";

const modals = {
	ADD_SETTLEMENTS_MODAL: "ADD_SETTLEMENTS_MODAL",
};

let columns = [];

// TODO: add h scroll for table
// test api calls and actions
class Settlement extends Component {
	state = {
		ADD_SETTLEMENT_MODAL: false,
	};

	componentDidMount() {
		const { getSettlementsList } = this.props;
		getSettlementsList();
	}

	handleDelete = key => {
		const { deleteAccount } = this.props;
		deleteAccount(key);
	};

	showModal = type => () => {
		this.setState({ ADD_SETTLEMENT_MODAL: true });
	};

	hideModal = type => () => {
		this.setState({ ADD_SETTLEMENT_MODAL: false });
	};

	render() {
		const { settlements, loading } = this.props;

		columns = [
			{
				title: "Account Number",
				key: "account_number",
				dataIndex: "account_number",
			},
			{
				title: "Name",
				key: "account_name",
				dataIndex: "account_name",
			},
			{
				title: "Description",
				key: "description",
				dataIndex: "description",
			},
			{
				title: "Brief Notes",
				key: "brief_notes",
				dataIndex: "brief_notes",
			},

			{
				title: "Action",
				key: "action",
				render: record =>
					settlements.length >= 1 ? (
						<Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
							<Button type="danger">
								<Icon type="delete" />
								Delete
							</Button>
						</Popconfirm>
					) : null,
			},
		];

		return (
			<>
				<PageTitle>Settlement Accounts</PageTitle>
				<Card>
					<div style={{ marginBottom: 30 }}>
						<Button type="primary" onClick={this.showModal(modals.ADD_SETTLEMENTS_MODAL)}>
							<Icon type="plus" /> Add new settlement account
						</Button>
					</div>

					<Table
						rowKey={record => record.id}
						columns={columns}
						loading={loading}
						dataSource={settlements}
						style={{ overflowX: "auto" }}
					/>
				</Card>

				<AddSettlementModal
					isModalVisible={this.state.ADD_SETTLEMENT_MODAL}
					hideModal={this.hideModal(modals.ADD_SETTLEMENT_MODAL)}
				/>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			settlements: state.settlements,
			loading: state.loading,
		};
	},
	{
		deleteAccount: Actions.settlements.deleteAccount,
		startLoading: Actions.loading.startLoading,
		getSettlementsList: Actions.settlements.getSettlementsList,
	}
)(Settlement);
