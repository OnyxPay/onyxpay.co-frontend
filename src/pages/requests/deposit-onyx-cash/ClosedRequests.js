import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { roles } from "api/constants";
import { push } from "connected-react-router";
import { renderPageTitle } from "../common";
import renderInitiatorColumns from "../table/columns/renderInitiatorColumns";
import renderPerformerColumns from "../table/columns/renderPerformerColumns";
import {
	getClosedDepositOcRequests,
	GET_CLOSED_OC_DEPOSIT_REQUESTS,
} from "redux/requests/onyxCash/closedDeposit";
import { createLoadingSelector } from "selectors/loading";
import { createRequestsDataSelector } from "selectors/requests";

class ClosedRequests extends Component {
	state = {
		pagination: { current: 1, pageSize: 20 },
	};

	componentDidMount() {
		this.fetch();
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
		const { pagination } = this.state;
		const { user, getClosedDepositOcRequests, location } = this.props;
		const params = {
			pageSize: pagination.pageSize,
			pageNum: pagination.current,
			...opts,
		};

		if (this.isUserInitiator(user.role, location)) {
			params.type = "buy_onyx_cash";
			params.user = "maker";
			params.status = "rejected,completed";
			console.log("i");

			getClosedDepositOcRequests(params, true);
		} else if (this.isUserPerformer(user.role, location)) {
			console.log("p");

			getClosedDepositOcRequests(params, false);
		}
	};

	isUserInitiator(userRole, location) {
		return (
			userRole === roles.a ||
			(userRole === roles.sa && location.pathname === "/closed-requests/deposit-onyx-cash")
		);
	}

	isUserPerformer(userRole, location) {
		return (
			userRole === roles.sa && location.pathname === "/closed-customer-requests/deposit-onyx-cash"
		);
	}

	render() {
		const { user, data, isFetching, location } = this.props;

		let columns = [];

		if (this.isUserInitiator(user.role, location)) {
			columns = renderInitiatorColumns({
				requestsStatus: "closed",
				requestsType: "depositOnyxCash",
			});
		} else if (this.isUserPerformer(user.role, location)) {
			columns = renderPerformerColumns({
				requestsStatus: "closed",
				requestsType: "depositOnyxCash",
			});
		}

		return (
			<>
				{renderPageTitle({
					requestType: "deposit",
					isRequestClosed: true,
					isUserInitiator: this.isUserInitiator(user.role, location),
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

const loadingSelector = createLoadingSelector([GET_CLOSED_OC_DEPOSIT_REQUESTS]);

function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: createRequestsDataSelector(state, "depositOnyxCash", "closed"),
		isFetching: loadingSelector(state),
	};
}

ClosedRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getClosedDepositOcRequests }
	)
)(ClosedRequests);

export default ClosedRequests;
