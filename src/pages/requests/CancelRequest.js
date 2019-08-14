import React, { Component } from "react";
import { Popover, Button, Spin } from "antd";
import { TextAligner } from "../../components/styled";
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
		if (!prevState.visible && prevState.visible !== this.state.visible) {
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
		const { disabled, handleCancel, isActionActive } = this.props;
		const { fetching, counter } = this.state;
		return (
			<Popover
				content={
					fetching ? (
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
								<Button size="small" type="primary" onClick={handleCancel}>
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
				<Button type="danger" loading={isActionActive} disabled={isActionActive || disabled}>
					Cancel
				</Button>
			</Popover>
		);
	}
}

export default CancelRequest;
