import React, { Component } from "react";
import { Popover, Button, Icon, Spin, message } from "antd";
import { TextAligner } from "../../components/styled";
import { cancelRequest } from "../../api/requests";
import { ContractAddressError, SendRawTrxError } from "../../utils/custom-error";

// TODO: get counter of cancellations
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
		try {
			await cancelRequest(requestId, "deposit");
		} catch (e) {
			console.log(e instanceof ContractAddressError);
			console.log(e instanceof SendRawTrxError);
			message.error(e.message);
		}
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
