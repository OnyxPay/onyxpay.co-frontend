import React, { Component } from "react";
import { Popover, Button, Icon, message, notification, Spin } from "antd";
import { TextAligner } from "../../components/styled";
import { cancelRequest, getRejectionCounter } from "../../api/requests";
// import { ContractAddressError, SendRawTrxError } from "../../utils/custom-error";
import { TimeoutError } from "promise-timeout";

class CancelRequest extends Component {
	state = {
		visible: false,
		loading: false,
		counter: null,
	};

	async componentDidUpdate(prevProps, prevState) {
		if (!prevState.visible && prevState.visible !== this.state.visible) {
			try {
				this.setState({ loading: true });
				const counter = await getRejectionCounter();
				this.setState({ loading: false, counter });
			} catch (e) {
				message.error(e.message);
			}
		}
	}

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
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		}
	};

	render() {
		const { btnStyle } = this.props;
		const { loading, counter } = this.state;
		return (
			<Popover
				content={
					loading ? (
						<Spin />
					) : (
						<div>
							<div>
								You have <strong>{3 - counter}</strong> cancellations left before blocking your
								account
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
					)
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
