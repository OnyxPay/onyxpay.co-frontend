import { Modal } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../../redux/actions";

class UserSettlement extends Component {
	constructor(props) {
		super();
		this.state = {
			visible: true,
		};
	}

	showModal = () => {
		const { getUserSetElementData } = this.props;
		getUserSetElementData();
		this.setState({
			visible: true,
		});
	};

	handleOk = e => {
		console.log(e);
		this.setState({
			visible: false,
		});
	};

	handleCancel = e => {
		console.log(e);
		this.setState({
			visible: false,
		});
	};

	componentWillMount = () => {
		const { getUserSetElementData } = this.props;
		getUserSetElementData();
	};

	render() {
		console.log(this.props);
		const { userSettlement } = this.props;
		return (
			<div>
				<Modal
					title="Basic Modal"
					visible={this.state.visible}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
				>
					<p>account_name: {userSettlement.account_name}</p>
					<p>account_number: {userSettlement.account_number}</p>
					<p>brief_notes: {userSettlement.brief_notes}</p>
					<p>created_at: {userSettlement.created_at}</p>
					<p>description: {userSettlement.description}</p>
					<p>updated_at: {userSettlement.updated_at}</p>
				</Modal>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	userSettlement: state.userSettlement,
});

export default connect(
	mapStateToProps,
	{
		getUserSetElementData: Actions.userSettlementAccountData.getUserSettlementData,
	}
)(UserSettlement);
