import React, { Component } from "react";
import { Popover, Button, Icon, Spin } from "antd";
import { TextAligner } from "../../components/styled";
import { cancelRequest } from "../../api/requests";

class CancelRequest extends Component {
	state = {
		visible: false,
	};

	hide = () => {
		this.setState({
			visible: false,
		});
	};

	handleVisibleChange = visible => {
		this.setState({ visible });
	};

	handleConfirm = async () => {
		const { requestId } = this.props;
		console.log("confirm");
		const res = await cancelRequest(requestId, "deposit");
	};

	render() {
		const { requestId, btnStyle } = this.props;
		return (
			<Popover
				content={
					<div>
						<div>
							You have <strong>2 cancellations left</strong> before blocking your account
						</div>
						<div>Sure to Cancel?</div>
						<TextAligner align="right">
							<Button size="small" style={{ marginRight: 8 }} onClick={this.hide}>
								No
							</Button>
							<Button size="small" type="primary" onClick={this.handleConfirm}>
								Ok
							</Button>
						</TextAligner>
					</div>
					// <Spin />
				}
				trigger="click"
				visible={this.state.visible}
				onVisibleChange={this.handleVisibleChange}
			>
				<Button type="danger" style={btnStyle}>
					<Icon type="delete" />
					Cancel
				</Button>
			</Popover>
		);
	}
}

export default CancelRequest;
