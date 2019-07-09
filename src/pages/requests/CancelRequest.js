import React, { Component } from "react";
import { Popover, Button, Spin } from "antd";
import { TextAligner } from "../../components/styled";
import { cancelRequest, getRejectionCounter } from "../../api/requests";
import { TimeoutError } from "promise-timeout";
import { showNotification, showTimeoutNotification } from "components/notification";

class CancelRequest extends Component {
	state = {
		visible: false,
		loading: false,
		counter: null,
		actionIsOn: false,
	};

	async componentDidUpdate(prevProps, prevState) {
		if (!prevState.visible && prevState.visible !== this.state.visible) {
			try {
				this.setState({ loading: true });
				const counter = await getRejectionCounter();
				this.setState({ loading: false, counter });
			} catch (e) {
				showNotification({
					type: "error",
					msg: e.message,
				});
			}
		}
	}

	hide = () => {
		this.setState({
			visible: false,
		});
	};

	handleVisibleChange = visible => {
		const { disabled } = this.props;
		if (!disabled) {
			this.setState({ visible });
		}
	};

	handleConfirm = async () => {
		const { requestId, fetchRequests } = this.props;
		try {
			this.setState({ actionIsOn: true });
			await cancelRequest(requestId, "deposit");
			fetchRequests();
			showNotification({
				type: "success",
				msg: "You have canceled the request",
			});
		} catch (e) {
			if (e instanceof TimeoutError) {
				showTimeoutNotification();
			} else {
				showNotification({
					type: "error",
					msg: e.message,
				});
			}
		} finally {
			this.setState({ actionIsOn: false });
		}
	};

	render() {
		const { btnStyle, disabled } = this.props;
		const { loading, counter, actionIsOn } = this.state;
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
				<Button
					type="danger"
					style={btnStyle}
					loading={actionIsOn}
					disabled={actionIsOn || disabled}
				>
					Cancel
				</Button>
			</Popover>
		);
	}
}

export default CancelRequest;
