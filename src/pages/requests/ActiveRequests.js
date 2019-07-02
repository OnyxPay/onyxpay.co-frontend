import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table, Button, Popconfirm, message, notification } from "antd";
import {
	getActiveRequests,
	acceptRequest,
	performRequest,
	cancelAcceptedRequest,
	complain,
} from "../../api/requests";
import { getMessages, hideMessage } from "../../api/operation-messages";
import CancelRequest from "./CancelRequest";
import SendToAgentModal from "../../components/modals/SendToAgent";
import { roles, operationMessageStatus } from "../../api/constants";
import { push } from "connected-react-router";
import { TimeoutError } from "promise-timeout";
import { convertAmountToStr } from "../../utils/number";

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
			pagination: { current: 1, pageSize: 20 },
			loading: false,
			SEND_REQ_TO_AGENT: false,
			requestId: null,
			isSendingMessage: false,
			operationMessages: [],
			activeAction: "",
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
		if (match.params.type === "withdraw") {
			return "withdraw";
		} else if (match.params.type === "deposit") {
			return "deposit";
		} else {
			push("/active-requests");
			return null;
		}
	}

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	showModal = (type, requestId, isSendingMessage = false, operationMessages = []) => () => {
		this.setState({ [type]: true, requestId, isSendingMessage, operationMessages });
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
		// TODO: use status from constants
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
					params.status = "pending,opened,choose,complained";
					data = await getActiveRequests(params);
				} else if (user.role === roles.a) {
					params.requestType = this.parseRequestType();
					params.requestStatus = "opened,choose,completed,complained";
					data = await getMessages(params);
				}
				const pagination = { ...this.state.pagination };
				pagination.total = data.total;

				console.log(data.items);
				this.setState({
					loading: false,
					data: data.items,
					pagination,
				});
			} catch (error) {}
		}
	};

	acceptRequest = async requestId => {
		// agent accepts deposit or withdraw request
		try {
			this.setState({ requestId, activeAction: "accept" });
			// await wait(10000);
			await acceptRequest(requestId);
			notification.success({
				message: "You have accepted the request",
			});
			this.fetch(); // update data in table
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	hideRequest = async requestId => {
		// agent can hide request
		try {
			await hideMessage(requestId);
			this.fetch(); // update data in table
		} catch (e) {
			message.error(e.message);
		}
	};

	isAgentAccepted(operationMessages) {
		// check if at least one agent is accepted the request
		return operationMessages.some(mg => mg.status_code === operationMessageStatus.accepted);
	}

	performRequest = async requestId => {
		// agent performs request
		try {
			this.setState({ requestId, activeAction: "perform" });
			// await wait(10000);
			await performRequest(requestId);
			notification.success({
				message: "You have performed the request",
			});
			this.fetch();
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	cancelAcceptedRequest = async requestId => {
		// agent performs request
		try {
			this.setState({ requestId, activeAction: "cancel_accepted_request" });
			await cancelAcceptedRequest(requestId);
			notification.success({
				message: "You have canceled the request",
			});
			this.fetch();
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	getPerformerName({ taker_addr: addr, operation_messages: messages } = {}) {
		const msg = messages.filter(msg => msg.receiver.wallet_addr === addr);

		const { first_name, last_name } = msg[0].receiver;
		if (first_name || last_name) {
			return `${first_name} ${last_name}`;
		} else {
			return addr;
		}
	}

	calcTimeDiff(timestamp) {
		const trxCreatedMs = new Date(timestamp).getTime();
		const nowMs = new Date().getTime();
		return nowMs - trxCreatedMs;
	}

	is24hOver(timestamp) {
		const diff = this.calcTimeDiff(timestamp);
		const h24Mc = 24 * 60 * 60 * 1000;
		return diff > h24Mc;
	}

	is12hOver(timestamp) {
		const diff = this.calcTimeDiff(timestamp);
		const h12Mc = 12 * 60 * 60 * 1000;
		return diff > h12Mc;
	}

	handleComplain = async (requestId, canComplain = false) => {
		if (canComplain) {
			try {
				this.setState({ requestId, activeAction: "complain" });
				await complain(requestId);
				// await wait(10000);
			} catch (e) {
				console.log(e);
			} finally {
				this.setState({ requestId: null, activeAction: "" });
			}
		} else {
			notification.info({
				message: "A complaint can only be filed 12 hours after the selection of the performer",
			});
		}
	};

	render() {
		const { user, walletAddress } = this.props;

		const columnsForClient = [
			{
				title: "Id",
				dataIndex: "id",
			},
			{
				title: "Asset",
				dataIndex: "asset",
			},
			{
				title: "Amount",
				render: (text, record, index) => {
					return convertAmountToStr(record.amount, 8);
				},
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
				title: "Performer",
				render: (text, record, index) => {
					return record.taker_addr ? this.getPerformerName(record) : "n/a";
				},
			},
			{
				title: "Actions",
				render: (text, record, index) => {
					const isComplainActive =
						record.request_id === this.state.requestId && this.state.activeAction === "complain";

					return (
						<>
							{record.status === "opened" && !record.operation_messages.length && (
								<Button
									style={style.btn}
									onClick={this.showModal(modals.SEND_REQ_TO_AGENT, record.id, true)}
								>
									Send to agents
								</Button>
							)}

							{(record.status === "opened" || record.status === "choose") && (
								<CancelRequest
									btnStyle={style.btn}
									requestId={record.request_id}
									fetchRequests={this.fetch}
									disabled={isComplainActive}
								/>
							)}
							{this.isAgentAccepted(record.operation_messages) && record.status === "opened" && (
								<Button
									style={style.btn}
									onClick={this.showModal(
										modals.SEND_REQ_TO_AGENT,
										record.request_id,
										false,
										record.operation_messages
									)}
								>
									Choose agent
								</Button>
							)}
						</>
					);
				},
			},
		];

		const columnsForAgent = [
			{
				title: "Id",
				dataIndex: "request.id",
			},
			{
				title: "Asset",
				dataIndex: "request.asset",
			},
			{
				title: "Amount",
				render: (text, record, index) => {
					return convertAmountToStr(record.request.amount, 8);
				},
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
				title: "Client",
				dataIndex: "sender.addr", // TODO: change to client's name
			},
			{
				title: "Actions",
				render: (text, record, index) => {
					const isAcceptActive =
						record.request.request_id === this.state.requestId &&
						this.state.activeAction === "accept";

					const isPerformActive =
						record.request.request_id === this.state.requestId &&
						this.state.activeAction === "perform";

					const isCancelAcceptedRequestActive =
						record.request.request_id === this.state.requestId &&
						this.state.activeAction === "cancel_accepted_request";

					return (
						<>
							{record.status !== "accepted" &&
								(isAcceptActive ? (
									<Button type="primary" style={style.btn} loading={true} disabled={true}>
										Accept
									</Button>
								) : (
									<Popconfirm
										title="Sure to accept?"
										onConfirm={() => this.acceptRequest(record.request.request_id)}
									>
										<Button type="primary" style={style.btn}>
											Accept
										</Button>
									</Popconfirm>
								))}

							{record.status !== "accepted" &&
								(isAcceptActive || isCancelAcceptedRequestActive ? (
									<Button type="danger" style={style.btn} disabled={true}>
										Hide
									</Button>
								) : (
									<Popconfirm
										title="Sure to hide?"
										onConfirm={() => this.hideRequest(record.id)} // messageId
									>
										<Button type="danger" style={style.btn}>
											Hide
										</Button>
									</Popconfirm>
								))}

							{record.request.taker_addr === walletAddress &&
								record.request.status !== "completed" &&
								(isPerformActive ? (
									<Button type="primary" style={style.btn} loading={true} disabled={true}>
										Perform
									</Button>
								) : (
									<Popconfirm
										title="Sure to perform?"
										onConfirm={() => this.performRequest(record.request.request_id)}
									>
										<Button type="primary" style={style.btn}>
											Perform
										</Button>
									</Popconfirm>
								))}

							{record.status === "accepted" &&
								record.request.taker_addr !== walletAddress &&
								(isCancelAcceptedRequestActive ? (
									<Button type="danger" style={style.btn} loading={true} disabled={true}>
										Cancel acceptation
									</Button>
								) : (
									<Popconfirm
										title="Sure to cancel acceptation?"
										cancelText="No"
										onConfirm={() => this.cancelAcceptedRequest(record.request.request_id)}
									>
										<Button type="danger" style={style.btn}>
											Cancel acceptation
										</Button>
									</Popconfirm>
								))}
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
					isSendingMessage={this.state.isSendingMessage}
					operationMessages={this.state.operationMessages}
					fetchRequests={this.fetch}
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
				walletAddress: state.wallet.defaultAccountAddress,
			};
		},
		{ push }
	)
)(ActiveRequests);

export default ActiveRequests;
