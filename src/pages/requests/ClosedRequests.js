import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Table } from "antd";
import { getActiveRequests } from "../../api/requests";
import { getMessagesForClosedRequests } from "../../api/operation-messages";
import { roles } from "../../api/constants";
import { push } from "connected-react-router";
import { convertAmountToStr } from "../../utils/number";
import { getPerformerName } from "../../utils";
import { PageTitle } from "../../components/styled";
import { parseRequestType, renderPageTitle } from "./common";

class ClosedRequests extends Component {
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
					return record.taker_addr ? getPerformerName(record) : "n/a";
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
				dataIndex: "sender.addr",
				render: (text, record, index) => {
					return `${record.sender.first_name} ${record.sender.last_name}`;
				},
			},
		];

		return (
			<>
				{renderPageTitle({
					userRole: user.role,
					requestType: parseRequestType({ match, push }),
					isRequestClosed: true,
				})}
				<Table
					columns={user.role === roles.c ? columnsForClient : columnsForAgent}
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
