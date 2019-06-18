import React, { Component } from "react";
import { Table, Button } from "antd";
import { getActiveRequests } from "../../api/requests";
import CancelRequest from "./CancelRequest";
import SendToAgentModal from "../../components/modals/deposit/SendToAgent";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
};

const style = {
	btn: {
		marginRight: 8,
	},
};

class DepositActiveRequests extends Component {
	state = {
		data: [],
		pagination: { current: 1, pageSize: 10 },
		loading: false,
		SEND_REQ_TO_AGENT: false,
		requestId: null,
	};

	componentDidMount() {
		this.fetch();
	}

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	showModal = (type, requestId) => () => {
		this.setState({ [type]: true, requestId });
	};

	handleTableChange = (pagination, filters, sorter) => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				this.fetch({
					...filters,
				});
			}
		);
	};

	fetch = async (opts = {}) => {
		const { pagination } = this.state;
		const params = {
			pageSize: pagination.pageSize,
			pageNum: pagination.current,
			type: "deposit",
			...opts,
		};
		try {
			this.setState({ loading: true });
			const data = await getActiveRequests(params);
			const pagination = { ...this.state.pagination };
			pagination.total = data.total;
			this.setState({
				loading: false,
				data: data.items,
				pagination,
			});
		} catch (error) {}
	};

	render() {
		const columns = [
			{
				title: "Asset",
				dataIndex: "asset",
			},
			{
				title: "Amount",
				dataIndex: "amount",
			},
			{
				title: "Status",
				dataIndex: "status",
			},
			{
				title: "Created",
				dataIndex: "trx_timestamp",
			},
			{
				title: "Action",
				render: (text, record, index) => {
					return (
						<>
							<Button
								style={style.btn}
								onClick={this.showModal(modals.SEND_REQ_TO_AGENT, record.id)}
							>
								Send to agents
							</Button>
							<CancelRequest btnStyle={style.btn} requestId={record.id} />
						</>
					);
				},
			},
		];

		return (
			<>
				<Table
					columns={columns}
					rowKey={record => record.id}
					dataSource={this.state.data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					onChange={this.handleTableChange}
					className="ovf-auto tbody-white"
				/>
				<SendToAgentModal
					isModalVisible={this.state.SEND_REQ_TO_AGENT}
					hideModal={this.hideModal(modals.SEND_REQ_TO_AGENT)}
					requestId={this.state.requestId}
				/>
			</>
		);
	}
}

export default DepositActiveRequests;
