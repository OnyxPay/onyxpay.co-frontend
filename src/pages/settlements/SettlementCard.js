import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Popconfirm, Table, Icon } from "antd";
import AddSettlementModal from "../../components/modals/AddSettlementModal";
import Actions from "../../redux/actions";
import { createLoadingSelector } from "selectors/loading";
import { FETCH_SETTLEMENTS_LIST } from "redux/settlements";

const modals = {
	ADD_SETTLEMENTS_MODAL: "ADD_SETTLEMENTS_MODAL",
};

class SettlementCard extends Component {
	state = {
		ADD_SETTLEMENT_MODAL: false,
		addAccount: false,
		editAccount: false,
	};

	componentDidMount() {
		const { getSettlementsList } = this.props;
		getSettlementsList();
	}

	handleDelete = key => {
		const { deleteAccount } = this.props;
		deleteAccount(key);
	};

	showModal = (type, settlementData) => () => {
		if (type === "edit") {
			this.setState({ editAccount: true, settlementData });
		} else {
			this.setState({ addAccount: true });
		}
		this.setState({ ADD_SETTLEMENT_MODAL: true });
	};

	hideModal = type => () => {
		this.setState({ ADD_SETTLEMENT_MODAL: false, editAccount: false, addAccount: false });
	};

	render() {
		const { settlements, loading } = this.props;

		const columns = [
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
						<>
							<Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
								<Button type="danger">
									<Icon type="delete" />
									Delete
								</Button>
							</Popconfirm>
							<Popconfirm
								title="Sure to edit?"
								onConfirm={this.showModal("edit", record, modals.ADD_SETTLEMENTS_MODAL)}
							>
								<Button type="primary">
									<Icon type="edit" />
									Edit
								</Button>
							</Popconfirm>
						</>
					) : null,
			},
		];

		return (
			<>
				<Card style={{ marginBottom: 24 }}>
					<div style={{ marginBottom: 30 }}>
						<Button type="primary" onClick={this.showModal("add", modals.ADD_SETTLEMENTS_MODAL)}>
							<Icon type="plus" /> Add new settlement account
						</Button>
					</div>

					<Table
						rowKey={record => record.id}
						columns={columns}
						loading={loading}
						dataSource={settlements}
						className="ovf-auto"
					/>
				</Card>

				<AddSettlementModal
					isModalVisible={this.state.ADD_SETTLEMENT_MODAL}
					hideModal={this.hideModal(modals.ADD_SETTLEMENT_MODAL)}
					addAccount={this.state.addAccount}
					editAccount={this.state.editAccount}
					settlementData={[this.state.settlementData]}
				/>
			</>
		);
	}
}

const loadingSelector = createLoadingSelector([FETCH_SETTLEMENTS_LIST]);

export default connect(
	state => {
		return {
			settlements: state.settlements,
			loading: loadingSelector(state),
		};
	},
	{
		deleteAccount: Actions.settlements.deleteAccount,
		getSettlementsList: Actions.settlements.getSettlementsList,
	}
)(SettlementCard);
