import React, { Component } from "react";
import { Input, message } from "antd";
import iPayPic from "../../assets/icons/iPay.png";
import { getPaymentForm } from "../../api/upgrade";
import { handleReqError } from "../../api/network";
export class IPayForm extends Component {
	state = {
		form: {},
	};
	formRef = React.createRef();
	handleSubmit(event) {
		event.preventDefault();
		getPaymentForm(this.props.amount).then(
			data => {
				this.setState({ form: data.data }, () => {
					this.formRef.current.submit();
					this.props.handleSubmit();
				});
			},
			err => {
				console.log(err);
				let errObj = handleReqError(err);
				if (errObj) {
					message.error("Internal error occured, HTTP status = " + errObj.error.status);
				}
			}
		);
	}

	render() {
		this.handleSubmit = this.handleSubmit.bind(this);
		return (
			<div>
				<form
					action="https://payments.ipayafrica.com/v3/ke"
					method="post"
					target="_blank"
					onSubmit={this.handleSubmit}
					ref={this.formRef}
					className="ipay-form"
				>
					{Object.keys(this.state.form).map(keyName => {
						return (
							<Input key={keyName} type="hidden" name={keyName} value={this.state.form[keyName]} />
						);
					})}
					<Input type="image" src={iPayPic} alt="Buy Now with iPay" className="ipay-form__input" />
				</form>
			</div>
		);
	}
}
