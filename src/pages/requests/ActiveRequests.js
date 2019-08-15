import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import queryString from "query-string";
import { push } from "connected-react-router";
import {
	acceptRequest,
	performRequest,
	cancelAcceptedRequest,
	complain,
	cancelRequest,
} from "api/requests";
import { hideMessage } from "api/operation-messages";
import ChoosePerformerModal from "components/modals/ChoosePerformer";
import { roles, operationType } from "api/constants";
import { showNotification } from "components/notification";
import { createLoadingSelector } from "selectors/loading";
import UserSettlementsModal from "components/modals/UserSettlementsModal";
import renderInitiatorColumns from "./table/columns/renderInitiatorColumns";
import renderPerformerColumns from "./table/columns/renderPerformerColumns";
import { renderPageTitle, aa, parseRequestType, isThisAgentInitiator } from "./common";
import { handleTableChange, getColumnSearchProps } from "./table";
import { getOpRequests, GET_OPERATION_REQUESTS, disableRequest } from "redux/requests";
import { handleBcError } from "api/network";
import { isAssetBlocked as checkIsAssetBlocked } from "api/assets";
import ShowUserDataModal from "components/modals/ShowUserData";

const modals = {
	SEND_REQ_TO_AGENT: "SEND_REQ_TO_AGENT",
	USER_SETTLEMENT_ACCOUNTS: "USER_SETTLEMENT_ACCOUNTS",
	SELECTED_USER_DATA: "SELECTED_USER_DATA",
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
			openedRequestData: {}, // to choose performer
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

	fetch = (opts = {}) => {
		const { pagination } = this.state;
		const { user, location, getOpRequests } = this.props;
		const params = {
			pageSize: pagination.pageSize,
			pageNum: pagination.current,
			...opts,
		};
		const requestType = parseRequestType(location);

		if (user.role === roles.c) {
			params.type = requestType;
			params.status = "pending,opened,choose,complained";
			params.user = "maker";
			// deposit | withdraw
			getOpRequests({ params, requestType, fetchActive: true, isInitiator: true });
		} else {
			let isAgentInitiator = isThisAgentInitiator(user.role, location);
			if (isAgentInitiator) {
				params.type = requestType;
				params.status = "pending,opened,choose,complained";
				params.user = "maker";
				getOpRequests({ params, requestType, fetchActive: true, isInitiator: true });
			} else {
				getOpRequests({ params, requestType, fetchActive: true, isInitiator: false });
			}
		}
	};

	handleAcceptRequest = async (requestId, requestAmount, requestAsset) => {
		// agent accepts deposit or withdraw request
		try {
			const { balanceAssets, balanceOnyxCash } = this.props;
			const isAssetBlocked = await checkIsAssetBlocked(requestAsset);
			if (isAssetBlocked) {
				showNotification({
					type: "error",
					msg: "Request cannot be accepted. Asset is blocked for technical works. Try again later.",
				});
				return;
			}

			this.setState({ requestId, activeAction: aa.accept });

			const allow = balanceAssets.some(
				balance =>
					(balance.symbol === requestAsset && requestAmount <= balance.amount) ||
					(requestAsset === "OnyxCash" && requestAmount <= balanceOnyxCash)
			);
			if (!allow) {
				showNotification({
					type: "error",
					msg: "Request cannot be accepted. Insufficient amount of asset.",
				});
				return;
			}
			await acceptRequest(requestId);
			showNotification({
				type: "success",
				msg: "You have accepted the request",
			});
			this.fetch();
		} catch (e) {
			handleBcError(e);
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
			handleBcError(e);
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
			handleBcError(e);
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	handleComplain = async (requestId, canComplain = false) => {
		// client complains
		if (canComplain) {
			try {
				this.setState({ requestId, activeAction: aa.complain });
				await complain(requestId);
				showNotification({
					type: "success",
					msg: "You have complained on the request",
				});
				this.fetch();
			} catch (e) {
				handleBcError(e);
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

	cancelRequest = async requestId => {
		try {
			this.setState({ requestId, activeAction: aa.cancel });
			await cancelRequest(requestId);
			this.fetch();
			showNotification({
				type: "success",
				msg: "You have canceled the request",
			});
		} catch (e) {
			handleBcError(e);
		} finally {
			this.setState({ requestId: null, activeAction: "" });
		}
	};

	render() {
		const { user, walletAddress, location, data, isFetching } = this.props;
		const { requestId, activeAction, idParsedFromURL, openedRequestData } = this.state;
		let columns = [];
		let isAgentInitiator = isThisAgentInitiator(user.role, location);

		if (user.role === roles.c || isAgentInitiator) {
			columns = renderInitiatorColumns({
				activeRequestId: requestId,
				activeAction,
				modals,
				fetchData: this.fetch,
				showModal: this.showModal,
				handleComplain: this.handleComplain,
				requestsType: parseRequestType(location),
				requestsStatus: "active",
				showUserSettlementsModal: settlementsId => {
					this.showModal(modals.USER_SETTLEMENT_ACCOUNTS, { settlementsId })();
				},
				showSelectedUserDataModal: selectedUserData => {
					this.showModal(modals.SELECTED_USER_DATA, { selectedUserData })();
				},
				performRequest: this.performRequest,
				cancelRequest: this.cancelRequest,
			});
		} else {
			columns = renderPerformerColumns({
				activeRequestId: requestId,
				activeAction,
				walletAddress,
				hideRequest: this.hideRequest,
				acceptRequest: this.handleAcceptRequest,
				cancelAcceptedRequest: this.cancelAcceptedRequest,
				performRequest: this.performRequest,
				getColumnSearchProps: getColumnSearchProps(this.setState, this.searchInput),
				defaultFilterValue: idParsedFromURL,
				requestsType: parseRequestType(location),
				requestsStatus: "active",
			});
		}

		return (
			<>
				{renderPageTitle({
					requestType: parseRequestType(location),
					isRequestClosed: false,
					isUserInitiator: user.role === roles.c || isAgentInitiator,
				})}
				<button
					onClick={() => {
						this.props.disableRequest(615);
					}}
				>
					disable request
				</button>
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
					rowClassName={(record, rowIndex) => {
						if (record._isDisabled) return "table-row-disabled";
					}}
				/>
				<ChoosePerformerModal
					isModalVisible={this.state.SEND_REQ_TO_AGENT}
					hideModal={this.hideModal(modals.SEND_REQ_TO_AGENT)}
					requestId={this.state.requestId}
					isSendingMessage={this.state.isSendingMessage}
					operationMessages={this.state.operationMessages}
					fetchRequests={this.fetch}
					showUserSettlementsModal={settlementsId => {
						this.showModal(modals.USER_SETTLEMENT_ACCOUNTS, { settlementsId: [settlementsId] })();
					}}
					performer={user.role === roles.c ? roles.a : roles.sa}
					openedRequestData={openedRequestData}
				/>
				<UserSettlementsModal
					isModalVisible={this.state.USER_SETTLEMENT_ACCOUNTS}
					hideModal={this.hideModal(modals.USER_SETTLEMENT_ACCOUNTS)}
					userId={this.state.settlementsId}
				/>
				<ShowUserDataModal
					visible={this.state.SELECTED_USER_DATA}
					hideModal={this.hideModal(modals.SELECTED_USER_DATA)}
					data={[this.state.selectedUserData]}
				/>
			</>
		);
	}
}

const loadingSelector = createLoadingSelector([GET_OPERATION_REQUESTS]);

function operationNameToType(name) {
	switch (name) {
		case "deposit":
			return operationType.deposit;
		case "withdraw":
			return operationType.withdraw;
		case "deposit-onyx-cash":
			return operationType.buyOnyxCache;
		default:
			return 0;
	}
}

function mapStateToProps(state, ownProps) {
	const requestName = parseRequestType(ownProps.location);
	const requestType = operationNameToType(requestName);
	let items = [];
	// we are filtering unnecessary types of requests to handle unnecessary websocket events
	if (state.opRequests.items) {
		items = state.opRequests.items.filter(el => {
			if (el.request) {
				return el.request.type_code === requestType;
			} else {
				return el.type_code === requestType;
			}
		});
	}

	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: { ...state.opRequests, items: items },
		isFetching: loadingSelector(state),
		balanceAssets: state.balance.assets,
		balanceOnyxCash: state.balance.onyxCash,
	};
}

ActiveRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getOpRequests, disableRequest }
	)
)(ActiveRequests);

export default ActiveRequests;
