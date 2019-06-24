import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table, Button, Popconfirm, message } from "antd";
import { getActiveRequests, acceptRequest } from "../../api/requests";
import { getMessages } from "../../api/operation-messages";
import CancelRequest from "./CancelRequest";
import SendToAgentModal from "../../components/modals/deposit/SendToAgent";
import { roles } from "../../api/constants";
import { push } from "connected-react-router";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
};

const style = {
	btn: {
		marginRight: 8,
	},
};

class ActiveRequests extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: { current: 1, pageSize: 10 },
			loading: false,
			SEND_REQ_TO_AGENT: false,
			requestId: null,
		};
	}

	componentDidMount() {
		this._isMounted = true;
		this.fetch();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentDidUpdate(prevProps, prevState) {
		const { location } = this.props;
		if (location.pathname !== prevProps.location.pathname) {
			this.fetch();
		}
	}

	parseRequestType() {
		const { match, push } = this.props;
		if (match.params.type === ":withdraw") {
			return "withdraw";
		} else if (match.params.type === ":deposit") {
			return "deposit";
		} else {
			push("/active-requests");
			return null;
		}
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
		if (this._isMounted) {
			const { pagination } = this.state;
			const { user } = this.props;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};

			try {
				this.setState({ loading: true });
				let data;
				if (user.role === roles.c) {
					params.type = this.parseRequestType();
					data = await getActiveRequests(params);
				} else if (user.role === "agent") {
					data = await getMessages(params);
				}
				const pagination = { ...this.state.pagination };
				pagination.total = data.total;
				this.setState({
					loading: false,
					data: data.items,
					pagination,
				});
			} catch (error) {}
		}
	};

	acceptRequest = async requestId => {
		try {
			await acceptRequest(requestId);
		} catch (e) {
			message.error(e.message);
		}
	};

	render() {
		const { user } = this.props;

		const columnsForClient = [
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
				render: (text, record, index) => {
					return new Date(record.trx_timestamp).toLocaleString();
				},
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
		const columnsForAgent = [
			{
				title: "Asset",
				dataIndex: "request.asset",
			},
			{
				title: "Amount",
				dataIndex: "request.amount",
			},
			{
				title: "Status",
				dataIndex: "request.status",
			},
			{
				title: "Created",
				render: (text, record, index) => {
					return new Date(record.request.trx_timestamp).toLocaleString();
				},
			},
			{
				title: "Action",
				render: (text, record, index) => {
					return (
						<>
							<Popconfirm
								title="Sure to accept?"
								onConfirm={() => this.acceptRequest(record.request.id)}
							>
								<Button type="primary">Accept</Button>
							</Popconfirm>
						</>
					);
				},
			},
		];

		return (
			<>
				<Table
					columns={user.role === roles.c ? columnsForClient : columnsForAgent}
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

ActiveRequests = compose(
	withRouter,
	connect(
		state => {
			return {
				user: state.user,
			};
		},
		{ push }
	)
)(ActiveRequests);

export default ActiveRequests;
