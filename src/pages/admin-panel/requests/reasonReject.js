import { Modal } from "antd";
import React, { Component } from "react";
import { Input } from "antd";

const { TextArea } = Input;

class ReasonReject extends Component {
	render() {
		const { visible } = this.props;
		return (
			<div>
				<Modal
					title="Basic Modal"
					visible={visible}
					onOk={() => this.props.handleOk(false)}
					onCancel={() => this.props.handleCancel(false)}
				>
					<>
						<TextArea
							placeholder="Please enter the reason"
							onChange={this.props.handleChange}
							autosize={{ minRows: 2, maxRows: 6 }}
						/>
					</>
				</Modal>
			</div>
		);
	}
}

export default ReasonReject;
