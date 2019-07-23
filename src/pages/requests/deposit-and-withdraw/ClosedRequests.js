import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { roles } from "api/constants";
import { push } from "connected-react-router";
import { parseRequestType, renderPageTitle } from "../common";
import renderInitiatorColumns from "../table/columns/renderInitiatorColumns";
import renderPerformerColumns from "../table/columns/renderPerformerColumns";
import { createLoadingSelector } from "selectors/loading";

import { getOpRequests, GET_OPERATION_REQUESTS } from "redux/requests";

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
			const { user, match, push, getOpRequests } = this.props;
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
					getOpRequests(params, "deposit", false, true);
				} else if (requestType === "withdraw") {
					getOpRequests(params, "withdraw", false, true);
				}
			} else if (user.role === roles.a) {
				if (requestType === "deposit") {
					getOpRequests(params, "deposit", false, false);
				} else if (requestType === "withdraw") {
					getOpRequests(params, "withdraw", false, false);
				}
			}
		}
	};

	render() {
		const { user, match, push, data, isFetching } = this.props;

		let columns = [];

		if (user.role === roles.c) {
			columns = renderInitiatorColumns({
				requestsStatus: "closed",
				requestsType: parseRequestType({ match, push }),
			});
		} else if (user.role === roles.a) {
			columns = renderPerformerColumns({
				requestsStatus: "closed",
				requestsType: parseRequestType({ match, push }),
			});
		}

		return (
			<>
				{renderPageTitle({
					requestType: parseRequestType({ match, push }),
					isRequestClosed: true,
					isUserInitiator: user.role === roles.c,
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

const loadingSelector = createLoadingSelector([GET_OPERATION_REQUESTS]);

function mapStateToProps(state, ownProps) {
	return {
		user: state.user,
		walletAddress: state.wallet.defaultAccountAddress,
		data: state.opRequests,
		isFetching: loadingSelector(state),
	};
}

ClosedRequests = compose(
	withRouter,
	connect(
		mapStateToProps,
		{ push, getOpRequests }
	)
)(ClosedRequests);

export default ClosedRequests;
