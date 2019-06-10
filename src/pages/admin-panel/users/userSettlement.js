import { Modal, List } from "antd";
import React, { Component } from "react";

class UserSettlement extends Component {
	constructor(props) {
		super();
		this.state = {
			visible: props.visible,
			data: [],
		};
	}

	componentDidMount = () => {
		const { settlementData } = this.props;
		settlementData.map(res =>
			this.setState({
				data: [
					`Account name : ${res.account_name}`,
					`Account number : ${res.account_number}`,
					`Notes: ${res.brief_notes}`,
					`Created account : ${res.created_at}`,
					`Description : ${res.description}`,
					`Updated account : ${res.updated_at}`,
				],
			})
		);
	};

	render() {
		if (!this.props.settlementData) return false;
		return (
			<div>
				<Modal
					title="Settlement"
					visible={this.state.visible}
					onOk={() => this.props.hideModal(false)}
					onCancel={() => this.props.hideModal(false)}
				>
					<List
						size="small"
						bordered
						dataSource={this.state.data}
						renderItem={item => <List.Item>{item}</List.Item>}
					/>
				</Modal>
			</div>
		);
	}
}

export default UserSettlement;
