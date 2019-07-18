import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { roles } from "api/constants";
import { push } from "connected-react-router";
import { parseRequestType, renderPageTitle } from "../common";
import renderClientColumns from "./table-columns/renderClientColumns";
import renderAgentColumns from "./table-columns/renderAgentColumns";
import {
	getClosedDepositRequests,
	GET_CLOSED_DEPOSIT_REQUESTS,
} from "redux/requests/assets/closedDeposit";
import {
	getClosedWithdrawRequests,
	GET_CLOSED_WITHDRAW_REQUESTS,
} from "redux/requests/assets/closedWithdraw";
import { createLoadingSelector } from "selectors/loading";
import { createRequestsDataSelector } from "selectors/requests";

class ClosedRequests extends Component {
	state = {
		pagination: { current: 1, pageSize: 20 },
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

	fetch = (opts = {}) => {
		if (this._isMounted) {
			const { pagination } = this.state;
			const { user, match, push, getClosedDepositRequests, getClosedWithdrawRequests } = this.props;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const requestType = parseRequestType({ match, push });

			if (user.role === roles.c) {
				params.type = requestType;
				params.status = "rejected,completed";
				params.user = "maker";
				if (requestType === "deposit") {
					getClosedDepositRequests(params, false);
				} else if (requestType === "withdraw") {
					getClosedWithdrawRequests(params, false);
				}
			} else if (user.role === roles.a) {
				if (requestType === "deposit") {
					getClosedDepositRequests(params, true);
				} else if (requestType === "withdraw") {
					getClosedWithdrawRequests(params, true);
				}
			}
		}
	};

	render() {
		const { user, match, push, data, isFetching } = this.props;

		let columns = [];

		if (user.role === roles.c) {
			columns = renderClientColumns({
				requestsStatus: "closed",
			});
		} else if (user.role === roles.a) {
			columns = renderAgentColumns({
				requestsStatus: "closed",
			});
		}

		return (
			<>
				{renderPageTitle({
					userRole: user.role,
					requestType: parseRequestType({ match, push }),
					isRequestClosed: true,
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
			</>
		);
	}
}

const loadingSelector = createLoadingSelector([
	GET_CLOSED_DEPOSIT_REQUESTS,
	GET_CLOSED_WITHDRAW_REQUESTS,
]);

function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: createRequestsDataSelector(state, ownProps.match.params.type, "closed"),
		isFetching: loadingSelector(state),
	};
}

ClosedRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getClosedDepositRequests, getClosedWithdrawRequests }
	)
)(ClosedRequests);

export default ClosedRequests;
