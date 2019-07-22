import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { acceptRequest, performRequest, cancelAcceptedRequest, complain } from "api/requests";
import { hideMessage } from "api/operation-messages";
import ChoosePerformerModal from "components/modals/ChoosePerformer";
import { roles } from "api/constants";
import { push } from "connected-react-router";
import { TimeoutError } from "promise-timeout";
import UserSettlementsModal from "components/modals/UserSettlementsModal";
import renderInitiatorColumns from "../table/columns/renderInitiatorColumns";
import renderPerformerColumns from "../table/columns/renderPerformerColumns";
import { renderPageTitle, aa } from "../common";
import { showNotification, showTimeoutNotification } from "components/notification";
import {
	GET_ACTIVE_DEPOSIT_OC_REQUESTS,
	getActiveDepositOcRequests,
} from "redux/requests/onyxCash/activeDeposit";
import { createLoadingSelector } from "selectors/loading";
import { createRequestsDataSelector } from "selectors/requests";
import queryString from "query-string";
import { handleTableChange, getColumnSearchProps } from "../table";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
	USER_SETTLEMENT_ACCOUNTS: "USER_SETTLEMENT_ACCOUNTS",
};

class ActiveRequests extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pagination: { current: 1, pageSize: 20 },
			[modals.SEND_REQ_TO_AGENT]: false,
			[modals.USER_SETTLEMENT_ACCOUNTS]: false,
			requestId: null,
			isSendingMessage: false,
			operationMessages: [],
			activeAction: "",
			idParsedFromURL: "",
		};
		this.setState = this.setState.bind(this);
		this.searchInput = "";
	}

	componentDidMount() {
		const { location } = this.props;

		const values = queryString.parse(location.search);
		if (values.id) {
			this.setState({ idParsedFromURL: values.id });
			this.fetch({ requestId: values.id });
		} else {
			this.fetch();
		}
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

	isUserInitiator(userRole, location) {
		return (
			userRole === roles.a ||
			(userRole === roles.sa && location.pathname === "/active-requests/deposit-onyx-cash")
		);
	}

	isUserPerformer(userRole, location) {
		return (
			userRole === roles.sa && location.pathname === "/active-customer-requests/deposit-onyx-cash"
		);
	}

	fetch = (opts = {}) => {
		const { pagination } = this.state;
		const { user, location, getActiveDepositOcRequests } = this.props;
		const params = {
			pageSize: pagination.pageSize,
			pageNum: pagination.current,
			...opts,
		};

		// initiator's requests
		if (this.isUserInitiator(user.role, location)) {
			params.type = "buy_onyx_cash";
			params.user = "maker";
			params.status = "pending,opened,choose,complained";
			getActiveDepositOcRequests(params, true);
			// performer's requests
		} else if (this.isUserPerformer(user.role, location)) {
			getActiveDepositOcRequests(params, false);
		}
	};

	acceptRequest = async requestId => {
		// agent accepts deposit or withdraw request
		try {
			this.setState({ requestId, activeAction: aa.accept });
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
		// agent performs deposit and client withdraw request
		try {
			this.setState({ requestId, activeAction: aa.perform });
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
			this.setState({ requestId, activeAction: aa.cancelAccepted });
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
				this.setState({ requestId, activeAction: aa.complain });
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
		const { user, walletAddress, data, isFetching, location } = this.props;
		const { requestId, activeAction, idParsedFromURL } = this.state;
		let columns = [];

		if (this.isUserInitiator(user.role, location)) {
			columns = renderInitiatorColumns({
				activeRequestId: requestId,
				activeAction,
				modals,
				fetchData: this.fetch,
				showModal: this.showModal,
				handleComplain: this.handleComplain,
				requestsType: "depositOnyxCash",
				requestsStatus: "active",
			});
		} else if (this.isUserPerformer(user.role, location)) {
			columns = renderPerformerColumns({
				activeRequestId: requestId,
				activeAction,
				walletAddress,
				hideRequest: this.hideRequest,
				acceptRequest: this.acceptRequest,
				cancelAcceptedRequest: this.cancelAcceptedRequest,
				performRequest: this.performRequest,
				getColumnSearchProps: getColumnSearchProps(this.setState, this.searchInput),
				defaultFilterValue: idParsedFromURL,
				requestsType: "depositOnyxCash",
				requestsStatus: "active",
			});
		}

		return (
			<>
				{renderPageTitle({
					requestType: "deposit",
					isRequestClosed: false,
					isUserInitiator: this.isUserInitiator(user.role, location),
				})}
				<Table
					columns={columns}
					rowKey={record => record.id}
					dataSource={data.items}
					pagination={{ ...this.state.pagination, total: data.total }}
					loading={isFetching}
					onChange={handleTableChange({
						fetchData: this.fetch,
						paginationState: this.state.pagination,
						setState: this.setState,
					})}
					className="ovf-auto tbody-white"
				/>
				<ChoosePerformerModal
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
					performer={roles.sa}
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

const loadingSelector = createLoadingSelector([GET_ACTIVE_DEPOSIT_OC_REQUESTS]);

function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: createRequestsDataSelector(state, "depositOnyxCash", "active"),
		isFetching: loadingSelector(state),
	};
}

ActiveRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getActiveDepositOcRequests }
	)
)(ActiveRequests);

export default ActiveRequests;
