import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Row, Col, Popconfirm, Table } from "antd";
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
		const { deleteSettlement } = this.props;
		deleteSettlement(key);
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
				title: "Name",
				key: "accountName",
				dataIndex: "accountName",
			},
			{
				title: "Number",
				key: "accountNumber",
				dataIndex: "accountNumber",
			},
			{
				title: "Brief Notes",
				key: "briefNotes",
				dataIndex: "briefNotes",
			},
			{
				title: "Description",
				key: "description",
				dataIndex: "description",
			},
			{
				title: "Action",
				key: "action",
				render: record =>
					settlements.length >= 1 ? (
						<Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
							<Button type="link" style={{ padding: 0 }}>
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
							Add new settlement account
						</Button>
					</div>

					<Row gutter={10}>
						<Col md={24} lg={24}>
							<Table
								rowKey={record => record.id}
								columns={columns}
								loading={loading}
								dataSource={settlements}
							/>
						</Col>
					</Row>
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
		deleteSettlement: Actions.settlements.deleteSettlement,
		startLoading: Actions.loading.startLoading,
		getSettlementsList: Actions.settlements.getSettlementsList,
	}
)(Settlement);
