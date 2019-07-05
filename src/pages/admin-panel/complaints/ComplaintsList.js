import React, { Component } from "react";
import { Button, Table } from "antd";
import ShowUserData from "../../../components/modals/admin/ShowUserData";
import { connect } from "react-redux";
import { getRequestsComplaint, HandleComplainedRequest } from "../../../api/admin/complaints";

const styles = {
	btn: {
		marginBottom: 5,
	},
	btnColor: {
		color: "rgba(0, 0, 0, 0.65)",
	},
};

class ComplaintsList extends Component {
	state = {
		visible: false,
		dataUser: [],
		data: [],
		pagination: { current: 1, pageSize: 20 },
		loadingRequestData: true,
	};

	componentDidMount = async () => {
		await this.fetchRequestComplain({ status: "complained" });
		this.setState({
			loadingRequestData: false,
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

	handleStartCheckComplaint = () => {
		alert("Start checking complaint");
	};

	HandleComplainedRequest = async (requestId, winnerAddress) => {
		try {
			const res = await HandleComplainedRequest(requestId, winnerAddress);
			console.log(res);
		} catch (error) {
			console.log(error);
		}
	};

	async fetchRequestComplain(opts = {}) {
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
				title: "Name initiator of the request",
				render: res => (
					<Button style={styles.btnColor} type="link" onClick={() => this.showUserData(res.maker)}>
						<span>{res.maker.first_name + " " + res.maker.last_name}</span>
					</Button>
				),
			},
			{
				title: "Name performer of the request",
				render: res => (
					<Button style={styles.btnColor} type="link" onClick={() => this.showUserData(res.taker)}>
						<span>{res.taker.first_name + " " + res.taker.last_name}</span>
					</Button>
				),
			},
			{
				title: "Currency",
				dataIndex: "asset",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Amount",
				dataIndex: "amount",
				render: res => (res ? res : "n/a"),
			},
			{
				title: "Date and time of request creation",
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
							onClick={() => this.handleStartCheckComplaint()}
							style={styles.btn}
							block
						>
							Start checking complaint
						</Button>
						<Button
							type="primary"
							onClick={() => this.HandleComplainedRequest(res.request_id, res.maker_addr)}
							style={styles.btn}
							block
						>
							Solve a complaint in favor of the initiator
						</Button>
						<Button
							type="primary"
							onClick={() => this.HandleComplainedRequest(res.request_id, res.taker_addr)}
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
				<Table
					columns={columns}
					loading={this.state.loadingRequestData}
					rowKey={data => data.id}
					dataSource={this.state.data}
				/>
				{this.state.visible ? (
					<ShowUserData
						visible={this.state.visible}
						hideModal={this.hideModal}
						data={[this.state.dataUser]}
					/>
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
