import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table, message, notification } from "antd";
import {
	getActiveRequests,
	acceptRequest,
	performRequest,
	cancelAcceptedRequest,
	complain,
} from "api/requests";
import { getMessages, hideMessage } from "api/operation-messages";
import SendToAgentModal from "components/modals/SendToAgent";
import { roles } from "api/constants";
import { push } from "connected-react-router";
import { TimeoutError } from "promise-timeout";
import { PageTitle } from "components/styled";
import UserSettlementsModal from "components/modals/UserSettlementsModal";
import renderClientColumns from "./table-columns/renderClientColumns";
import renderAgentColumns from "./table-columns/renderAgentColumns";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
	USER_SETTLEMENT_ACCOUNTS: "USER_SETTLEMENT_ACCOUNTS",
};

class ActiveRequests extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pagination: { current: 1, pageSize: 20 },
			loading: false,
			[modals.SEND_REQ_TO_AGENT]: false,
			[modals.USER_SETTLEMENT_ACCOUNTS]: false,
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

	showModal = (type, options) => () => {
		if (options) {
			const { requestId, isSendingMessage = false, operationMessages = [] } = options;
			this.setState({ [type]: true, requestId, isSendingMessage, operationMessages });
		} else {
			this.setState({ [type]: true });
		}
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
					params.status = "pending,opened,choose,complained";
					data = await getActiveRequests(params);
				} else if (user.role === roles.a) {
					params.requestType = this.parseRequestType();
					params.requestStatus = "opened,choose,completed,complained";
					// params.isTaker = 0;
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

	handleComplain = async (requestId, canComplain = false) => {
		if (canComplain) {
			try {
				this.setState({ requestId, activeAction: "complain" });
				await complain(requestId);
				notification.success({
					message: "You have complained on the request",
				});
				this.fetch();
			} catch (e) {
				message.error(e.message);
			} finally {
				this.setState({ requestId: null, activeAction: "" });
			}
		} else {
			notification.info({
				message: "A complaint can only be filed 12 hours after the selection of the performer",
			});
		}
	};

	renderTitle() {
		const { user } = this.props;
		const requestType = this.parseRequestType();
		if (user.role === roles.c) {
			return <PageTitle>Active {requestType} requests</PageTitle>;
		} else if (user.role === roles.a) {
			return <PageTitle>Customer active {requestType} requests</PageTitle>;
		}
	}

	render() {
		const { user, walletAddress } = this.props;
		const { requestId, activeAction } = this.state;
		let columns = [];

		if (user.role === roles.c) {
			columns = renderClientColumns({
				activeRequestId: requestId,
				activeAction,
				modals,
				fetchData: this.fetch,
				showModal: this.showModal,
				handleComplain: this.handleComplain,
			});
		} else if (user.role === roles.a) {
			columns = renderAgentColumns({
				activeRequestId: requestId,
				activeAction,
				walletAddress,
				hideRequest: this.hideRequest,
				acceptRequest: this.acceptRequest,
				cancelAcceptedRequest: this.cancelAcceptedRequest,
				performRequest: this.performRequest,
			});
		}

		return (
			<>
				{this.renderTitle()}
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
					isSendingMessage={this.state.isSendingMessage}
					operationMessages={this.state.operationMessages}
					fetchRequests={this.fetch}
					showUserSettlementsModal={this.showModal(modals.USER_SETTLEMENT_ACCOUNTS)}
				/>
				<UserSettlementsModal
					isModalVisible={this.state.USER_SETTLEMENT_ACCOUNTS}
					hideModal={this.hideModal(modals.USER_SETTLEMENT_ACCOUNTS)}
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
