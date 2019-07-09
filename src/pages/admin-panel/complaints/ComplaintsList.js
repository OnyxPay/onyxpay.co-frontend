import React, { Component } from "react";
import { Button, Table } from "antd";
import ShowUserData from "../../../components/modals/admin/ShowUserData";
import { connect } from "react-redux";
import { getRequestsComplaint, handleComplainedRequest } from "../../../api/admin/complaints";
import { PageTitle } from "../../../components";

const styles = {
	btn: {
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
		loadingRequestComplaintsData: true,
		loadingSolve: false,
		userId: null,
		requestId: null,
	};

	componentDidMount = async () => {
		await this.fetchRequestComplaint({ status: "complained" });
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

	handleComplainedRequests = async (requestId, winner, resId) => {
		try {
			this.setState({
				loadingSolve: true,
				userId: resId,
				requestId: requestId,
			});
			const res = await handleComplainedRequest(requestId, winner);
			console.log(res);
			this.fetchRequestComplaint({ status: "complained" });
		} catch (error) {
			console.log(error);
		} finally {
			this.setState({
				loadingSolve: false,
			});
		}
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
			console.log(res);
			this.setState({
				data: res.items,
			});
			pagination.total = res.items.total;
		} catch (e) {
			console.log(e);
		}
	}

	render() {
		const {
			data,
			visible,
			dataUser,
			loadingRequestComplaintsData,
			requestId,
			loadingSolve,
			userId,
		} = this.state;
		if (!data) {
			return null;
		}
		const columns = [
			{
				title: "Type request",
				dataIndex: "type",
				render: res => (res ? res : "n/a"),
			},
			/*{
				title: "Having complained",
				dataIndex: "having_complained",
			},*/
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
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Created",
				dataIndex: "created_at",
				render: res => (res ? new Date(res).toLocaleString() : "n/a"),
			},
			{
				title: "Action",
				key: "action",
				width: "20%",
				dataIndex: "",
				render: res => (
					<>
						<Button
							type="primary"
							onClick={() =>
								this.handleComplainedRequests(res.request_id, "winnerClient", res.maker.id)
							}
							style={styles.btn}
							block
							loading={res.maker.id === userId && res.request_id === requestId && loadingSolve}
						>
							Solve a complaint in favor of the initiator
						</Button>
						<Button
							type="primary"
							loading={res.taker.id === userId && res.request_id === requestId && loadingSolve}
							onClick={() =>
								this.handleComplainedRequests(res.request_id, "winnerAgent", res.taker.id)
							}
							style={styles.btn}
							block
						>
							Solve a complaint in favor of the performer
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
