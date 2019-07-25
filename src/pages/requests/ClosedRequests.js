import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { push } from "connected-react-router";
import { roles } from "api/constants";
import { createLoadingSelector } from "selectors/loading";
import { parseRequestType, renderPageTitle, isThisAgentInitiator } from "./common";
import renderInitiatorColumns from "./table/columns/renderInitiatorColumns";
import renderPerformerColumns from "./table/columns/renderPerformerColumns";

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
			const { user, location, getOpRequests } = this.props;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const requestType = parseRequestType(location);
			if (user.role === roles.c) {
				params.type = requestType;
				params.status = "rejected,completed";
				params.user = "maker";
				getOpRequests({ params, requestType, fetchActive: false, isInitiator: true });
			} else {
				let isAgentInitiator = isThisAgentInitiator(user.role, location);
				if (isAgentInitiator) {
					params.status = "rejected,completed";
					params.user = "maker";
					getOpRequests({ params, requestType, fetchActive: false, isInitiator: true });
				} else {
					getOpRequests({ params, requestType, fetchActive: false, isInitiator: false });
				}
			}
		}
	};

	render() {
		const { user, location, data, isFetching } = this.props;
		let isAgentInitiator = isThisAgentInitiator(user.role, location);
		let columns = [];

		if (user.role === roles.c || isAgentInitiator) {
			columns = renderInitiatorColumns({
				requestsStatus: "closed",
				requestsType: parseRequestType(location),
			});
		} else {
			columns = renderPerformerColumns({
				requestsStatus: "closed",
				requestsType: parseRequestType(location),
			});
		}

		return (
			<>
				{renderPageTitle({
					requestType: parseRequestType(location),
					isRequestClosed: true,
					isUserInitiator: user.role === roles.c || isAgentInitiator,
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
