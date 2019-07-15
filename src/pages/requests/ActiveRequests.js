import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { acceptRequest, performRequest, cancelAcceptedRequest, complain } from "api/requests";
import { hideMessage } from "api/operation-messages";
import SendToAgentModal from "components/modals/SendToAgent";
import { roles } from "api/constants";
import { push } from "connected-react-router";
import { TimeoutError } from "promise-timeout";
import UserSettlementsModal from "components/modals/UserSettlementsModal";
import renderClientColumns from "./table-columns/renderClientColumns";
import renderAgentColumns from "./table-columns/renderAgentColumns";
import { parseRequestType, renderPageTitle } from "./common";
import { showNotification, showTimeoutNotification } from "components/notification";
import {
	GET_ACTIVE_DEPOSIT_REQUESTS,
	getActiveDepositRequests,
} from "redux/requests/assets/activeDeposit";
import {
	getActiveWithdrawRequests,
	GET_ACTIVE_WITHDRAW_REQUESTS,
} from "redux/requests/assets/activeWithdraw";
import { createLoadingSelector } from "selectors/loading";
import { createRequestsDataSelector } from "selectors/requests";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
	USER_SETTLEMENT_ACCOUNTS: "USER_SETTLEMENT_ACCOUNTS",
};

class ActiveRequests extends Component {
	state = {
		pagination: { current: 1, pageSize: 20 },
		[modals.SEND_REQ_TO_AGENT]: false,
		[modals.USER_SETTLEMENT_ACCOUNTS]: false,
		requestId: null,
		isSendingMessage: false,
		operationMessages: [],
		activeAction: "",
	};

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

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	showModal = (type, options) => () => {
		if (options) {
			this.setState({ [type]: true, ...options });
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
			const { user, match, push, getActiveDepositRequests, getActiveWithdrawRequests } = this.props;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const requestType = parseRequestType({ match, push });

			if (user.role === roles.c) {
				params.type = requestType;
				params.status = "pending,opened,choose,complained";
				params.user = "maker";
				if (requestType === "deposit") {
					getActiveDepositRequests(params, false);
				} else if (requestType === "withdraw") {
					getActiveWithdrawRequests(params, false);
				}
			} else if (user.role === roles.a) {
				if (requestType === "deposit") {
					getActiveDepositRequests(params, true);
				} else if (requestType === "withdraw") {
					getActiveWithdrawRequests(params, true);
				}
			}
		}
	};

	acceptRequest = async requestId => {
		// agent accepts deposit or withdraw request
		try {
			this.setState({ requestId, activeAction: "accept" });
			await acceptRequest(requestId);
			showNotification({
				type: "success",
				msg: "You have accepted the request",
			});
			this.fetch();
		} catch (e) {
			if (e instanceof TimeoutError) {
				showTimeoutNotification();
			} else {
				showNotification({
					type: "error",
					msg: e.message,
				});
			}
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	hideRequest = async requestId => {
		// agent hides request
		try {
			await hideMessage(requestId);
			this.fetch();
		} catch (e) {
			showNotification({
				type: "error",
				msg: e.message,
			});
		}
	};

	performRequest = async requestId => {
		// agent performs request
		try {
			this.setState({ requestId, activeAction: "perform" });
			await performRequest(requestId);
			showNotification({
				type: "success",
				msg: "You have performed the request",
			});
			this.fetch();
		} catch (e) {
			if (e instanceof TimeoutError) {
				showTimeoutNotification();
			} else {
				showNotification({
					type: "error",
					msg: e.message,
				});
			}
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	cancelAcceptedRequest = async requestId => {
		// agent cancels request
		try {
			this.setState({ requestId, activeAction: "cancel_accepted_request" });
			await cancelAcceptedRequest(requestId);
			showNotification({
				type: "success",
				msg: "You have cancelled the request, the assets will be sent back on your address.",
			});
			this.fetch();
		} catch (e) {
			if (e instanceof TimeoutError) {
				showTimeoutNotification();
			} else {
				showNotification({
					type: "error",
					msg: e.message,
				});
			}
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	handleComplain = async (requestId, canComplain = false) => {
		// client complains
		if (canComplain) {
			try {
				this.setState({ requestId, activeAction: "complain" });
				const res = await complain(requestId);
				console.log("complained", res);

				showNotification({
					type: "success",
					msg: "You have complained on the request",
				});
				this.fetch();
			} catch (e) {
				showNotification({
					type: "error",
					msg: e.message,
				});
			} finally {
				this.setState({ requestId: null, activeAction: "" });
			}
		} else {
			showNotification({
				type: "info",
				msg: "A complaint can only be filed 12 hours after the selection of the performer",
			});
		}
	};

	render() {
		const { user, walletAddress, match, push, data, isFetching } = this.props;
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
				{renderPageTitle({
					userRole: user.role,
					requestType: parseRequestType({ match, push }),
					isRequestClosed: false,
				})}
				<Table
					columns={columns}
					rowKey={record => record.id}
					dataSource={data.items}
					pagination={{ ...this.state.pagination, total: data.total }}
					loading={isFetching}
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
					showUserSettlementsModal={settlementsId =>
						this.showModal(modals.USER_SETTLEMENT_ACCOUNTS, {
							settlementsId,
						})()
					}
				/>
				<UserSettlementsModal
					isModalVisible={this.state.USER_SETTLEMENT_ACCOUNTS}
					hideModal={this.hideModal(modals.USER_SETTLEMENT_ACCOUNTS)}
					userId={this.state.settlementsId}
				/>
			</>
		);
	}
}

const loadingSelector = createLoadingSelector([
	GET_ACTIVE_DEPOSIT_REQUESTS,
	GET_ACTIVE_WITHDRAW_REQUESTS,
]);

function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: createRequestsDataSelector(state, ownProps.match.params.type),
		isFetching: loadingSelector(state),
	};
}

ActiveRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getActiveDepositRequests, getActiveWithdrawRequests }
	)
)(ActiveRequests);

export default ActiveRequests;
