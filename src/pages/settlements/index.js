import React, { Component } from "react";
import { Card, Button, Row, Col, Popconfirm, Table } from "antd";

import { PageTitle } from "../../components";
import AddSettlementtModal from "../../components/modals/addSettlementsModal";

import { getStore } from "../../store";
import Actions from "../../redux/actions";
const store = getStore();

const modals = {
	ADD_SETTLEMENTS_MODAL: "ADD_SETTLEMENTS_MODAL",
};

let columns = [];

class Settlement extends Component {
	state = {
		initLoading: true,
		dataSource: [],
		ADD_SETTLEMENT_MODAL: false,
	};

	componentDidMount() {
		store.subscribe(() => {
			this.setState({
				initLoading: false,
				dataSource: store.getState().settlements,
			});
		});

		store.dispatch(Actions.settlements.getSettlementsList());

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
					this.state.dataSource.length >= 1 ? (
						<Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
							<a href="javascript:;">Delete</a>
						</Popconfirm>
					) : null,
			},
		];
	}

	handleDelete = key => {
		store.dispatch(Actions.settlements.deleteItem(key));
	};

	showModal = type => () => {
		this.setState({ ADD_SETTLEMENT_MODAL: true });
	};

	hideModal = type => () => {
		this.setState({ ADD_SETTLEMENT_MODAL: false });
	};

	render() {
		const { initLoading, dataSource } = this.state;

		return (
			<>
				<PageTitle>Settlement Accounts</PageTitle>
				<Card>
					<Row gutter={10}>
						<Col md={24} lg={24}>
							<Table
								rowKey={record => record.id}
								columns={columns}
								loading={initLoading}
								dataSource={dataSource}
							/>

							<Button
								block
								type="primary"
								style={{ marginBottom: 5, marginTop: 20, width: "auto" }}
								onClick={this.showModal(modals.ADD_SETTLEMENTS_MODAL)}
							>
								Add settlemt account
							</Button>
						</Col>
					</Row>
				</Card>

				<AddSettlementtModal
					isModalVisible={this.state.ADD_SETTLEMENT_MODAL}
					hideModal={this.hideModal(modals.ADD_SETTLEMENT_MODAL)}
				/>
			</>
		);
	}
}

export default Settlement;
