import React, { Component } from "react";
import {
	Typography,
	Card,
	Button,
	Input,
	Row,
	Col,
	Form,
	List,
	Avatar,
	Skeleton,
	Popconfirm,
	Table,
} from "antd";

import { PageTitle } from "../../components";
import * as axios from "axios";
import { BackendUrl, temporaryToken } from "../../api/constants";
import AddSettlementtModal from "../../components/modals/addSettlementsModal";

const modals = {
	ADD_SETTLEMENTS_MODAL: "ADD_SETTLEMENTS_MODAL",
};

let columns = [];

const headers = {
	authorization: `bearer ${temporaryToken}`,
};

class Settlement extends Component {
	state = {
		initLoading: true,
		dataSource: [],
		ADD_SETTLEMENT_MODAL: false,
	};

	componentDidMount() {
		// let formData = new FormData();
		// formData.append("first_name", "first_name");
		// formData.append("last_name", "last_name");
		// formData.append("wallet_addr", "21");
		// formData.append("public_key", "1");
		// formData.append("country_id", 1324567890);
		// axios.post(`${BackendUrl}/api/v1/sign-up`, formData).then(res => {
		// 	console.log("/api/v1/sign-up ", res);
		// });

		// ------------- GET
		axios.get(`${BackendUrl}/api/v1/settlements`, { headers }).then(res => {
			console.log("GET Settlements ", res.data.data);
			this.setState({
				initLoading: false,
				dataSource: res.data.data,
			});
		});

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
		axios
			.delete(`${BackendUrl}/api/v1/settlements/${key}`, {
				headers: headers,
			})
			.then(res => {
				const dataSource = [...this.state.dataSource];
				this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
				console.log("DELETE ", res.data);
			});
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
