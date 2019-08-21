import React, { Component } from "react";
import { Popover, Button, Spin, Icon } from "antd";
import { getRejectionCounter } from "../../api/requests";
import { handleBcError } from "api/network";

class CancelRequest extends Component {
	state = {
		visible: false,
		fetching: false,
		counter: null,
		actionIsOn: false,
	};

	async componentDidUpdate(prevProps, prevState) {
		if (this.props.punish && !prevState.visible && prevState.visible !== this.state.visible) {
			try {
				this.setState({ fetching: true });
				const counter = await getRejectionCounter();
				this.setState({ fetching: false, counter });
			} catch (e) {
				handleBcError(e);
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

	render() {
		const { disabled, handleCancel, isActionActive, punish } = this.props;
		const { fetching, counter } = this.state;
		let content;
		if (fetching) {
			content = <Spin />;
		} else {
			content = (
				<div>
					{punish && (
						<div>
							You have <strong>{3 - counter}</strong> cancellations left before blocking your
							account
						</div>
					)}
					<div className="ant-popover-message">
						<Icon type="exclamation-circle" />
						<div className="ant-popover-message-title">Sure to Cancel?</div>
					</div>
					<div className="ant-popover-buttons">
						<Button size="small" onClick={this.hide}>
							No
						</Button>
						<Button size="small" type="primary" onClick={handleCancel}>
							Ok
						</Button>
					</div>
				</div>
			);
		}

		return (
			<Popover
				content={content}
				trigger="click"
				visible={this.state.visible}
				onVisibleChange={this.handleVisibleChange}
			>
				<Button type="danger" loading={isActionActive} disabled={isActionActive || disabled}>
					Cancel
				</Button>
			</Popover>
		);
	}
}

export default CancelRequest;
