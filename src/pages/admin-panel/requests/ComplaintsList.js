import React, { Component } from "react";
import { Button, Table } from "antd";
import ShowUserData from "components/modals/admin/ShowUserData";
import { connect } from "react-redux";
import { getRequestsComplaint, handleComplainedRequest } from "api/admin/complaints";
import { PageTitle } from "components";
import { convertAmountToStr } from "utils/number";

const styles = {
	btn: {
		marginRight: 5,
		marginBottom: 5,
	},
	btnColor: {
		color: "rgba(0, 0, 0, 0.65)",
		padding: 0,
	},
};

class ComplaintsList extends Component {
	state = {
		visible: false,
		dataUser: null,
		data: null,
		pagination: { current: 1, pageSize: 20 },
		loadingRequestComplaintsData: false,
		loadingSolve: false,
		userId: null,
		requestId: null,
	};

	componentDidMount = async () => {
		this.setState({
			loadingRequestComplaintsData: true,
		});
		await this.fetchRequestComplaint({ is_complain: 1, status: "complained" });
		this.setState({
			loadingRequestComplaintsData: false,
		});
	};

	showUserData = data => {
		this.setState({
			visible: true,
			dataUser: data,
		});
	};

	hideModal = visible => {
		this.setState({
			visible: visible,
		});
	};

	handleComplainedRequests = async (requestId, winner, userId) => {
		try {
			this.setState({
				loadingSolve: true,
				userId: userId,
				requestId: requestId,
			});
			const res = await handleComplainedRequest(requestId, winner);
			console.log(res);
			setTimeout(() => this.fetchRequestComplaint({ is_complain: 1, status: "complained" }), 3000);
		} catch (error) {
			console.log(error);
		} finally {
			this.setState({
				loadingSolve: false,
			});
		}
	};

	handleTableChange = (pagination, filters) => {
		this.setState(
			{
				pagination: {
					...this.state.pagination,
					current: pagination.current,
					pageSize: pagination.pageSize,
				},
			},
			() => {
				this.fetchRequestComplaint({
					...filters,
					is_complain: 1,
					status: "complained",
				});
			}
		);
	};

	async fetchRequestComplaint(opts = {}) {
		try {
			const { pagination } = this.state;
			const params = {
				pageSize: pagination.pageSize,
				pageNum: pagination.current,
				...opts,
			};
			const res = await getRequestsComplaint(params);
			pagination.total = res.total;
			this.setState({
				data: res.items,
				pagination,
			});
		} catch (e) {
			console.log(e);
		}
	}

	render() {
		console.log(this.state);
		const {
			data,
			visible,
			dataUser,
			loadingRequestComplaintsData,
			requestId,
			loadingSolve,
			userId,
			pagination,
		} = this.state;
		const columns = [
			{
				title: "Type request",
				dataIndex: "type",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Name initiator",
				render: res => (
					<Button style={styles.btnColor} type="link" onClick={() => this.showUserData(res.maker)}>
						<span>{res.maker.first_name + " " + res.maker.last_name}</span>
					</Button>
				),
			},
			{
				title: "Name performer",
				render: res => (
					<Button style={styles.btnColor} type="link" onClick={() => this.showUserData(res.taker)}>
						<span>{res.taker.first_name + " " + res.taker.last_name}</span>
					</Button>
				),
			},
			{
				title: "Asset",
				dataIndex: "asset",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Amount",
				dataIndex: "amount",
				render: res => (res ? convertAmountToStr(res, 8) : "n/a"),
			},
			{
				title: "Created",
				dataIndex: "created_at",
				render: res => (res ? new Date(res).toLocaleString() : "n/a"),
			},
			{
				title: "Action",
				key: "action",
				width: "30%",
				dataIndex: "",
				render: res => (
					<>
						<Button
							type="primary"
							onClick={() =>
								this.handleComplainedRequests(res.request_id, "winnerClient", res.maker.id)
							}
							style={styles.btn}
							loading={res.maker.id === userId && res.request_id === requestId && loadingSolve}
						>
							Winner {res.maker.first_name + " " + res.maker.last_name}
						</Button>
						<Button
							type="primary"
							loading={res.taker.id === userId && res.request_id === requestId && loadingSolve}
							onClick={() =>
								this.handleComplainedRequests(res.request_id, "winnerAgent", res.taker.id)
							}
							style={styles.btn}
						>
							Winner {res.taker.first_name + " " + res.taker.last_name}
						</Button>
					</>
				),
			},
		];

		return (
			<>
				<PageTitle>Complaints</PageTitle>
				<Table
					columns={columns}
					loading={loadingRequestComplaintsData}
					rowKey={data => data.id}
					dataSource={data}
					className="ovf-auto"
					onChange={this.handleTableChange}
					pagination={pagination}
				/>
				{visible ? (
					<ShowUserData visible={visible} hideModal={this.hideModal} data={[dataUser]} />
				) : null}
			</>
		);
	}
}
export default connect(
	null,
	{
		getRequestsComplaint,
	}
)(ComplaintsList);