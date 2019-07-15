import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { getActiveRequests } from "../../api/requests";
import { getMessagesForClosedRequests } from "../../api/operation-messages";
import { roles } from "../../api/constants";
import { push } from "connected-react-router";
import { parseRequestType, renderPageTitle } from "./common";
import renderClientColumns from "./table-columns/renderClientColumns";
import renderAgentColumns from "./table-columns/renderAgentColumns";

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

	fetch = async (opts = {}) => {
		if (this._isMounted) {
			const { pagination } = this.state;
			const { user, match, push } = this.props;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};

			try {
				this.setState({ loading: true });
				let data;
				if (user.role === roles.c) {
					params.type = parseRequestType({ match, push });
					params.status = "rejected,completed";
					params.user = "maker";
					data = await getActiveRequests(params);
				} else if (user.role === roles.a) {
					// params.requestType = parseRequestType({ match, push });
					// params.requestStatus = "completed";
					// params.messageStatus = "canceled";
					data = await getMessagesForClosedRequests(params);
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

	render() {
		const { user, match, push } = this.props;

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
					dataSource={this.state.data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					onChange={this.handleTableChange}
					className="ovf-auto tbody-white"
				/>
			</>
		);
	}
}

ClosedRequests = compose(
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
)(ClosedRequests);

export default ClosedRequests;
