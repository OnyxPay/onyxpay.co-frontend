import React, { Component } from "react";
import { Input } from "antd";
import { backEndRestEndpoint } from "../../api/constants";
import CoinPaymentsPic from "../../assets/icons/CoinPayments.png";

export class CoinPaymentsForm extends Component {
	getUrl = () => {
		let amountf = encodeURIComponent(this.props.amount);
		let firstName = encodeURIComponent(this.props.user.firstName);
		let lastName = encodeURIComponent(this.props.user.lastName);
		let email = encodeURIComponent(this.props.user.email);
		let ipn_url = encodeURIComponent(backEndRestEndpoint + "/coinpayment");
		return `https://www.coinpayments.net/index.php?cmd=_pay&reset=1&merchant=46ed83339e6e0252cb80d762294470da&item_name=OnyxCash&currency=USD&amountf=${amountf}&quantity=1&allow_quantity=0&want_shipping=0&first_name=${firstName}&last_name=${lastName}&email=${email}&ipn_url=${ipn_url}&allow_extra=0&x=115&y=35`;
	};

	render() {
		return (
			<div>
				<form
					action="https://www.coinpayments.net/index.php"
					method="get"
					target="_blank"
					onSubmit={e => {
						if (navigator.appVersion.includes("Android")) {
							e.preventDefault();
							window.dispatchEvent(new CustomEvent("openURL", { detail: this.getUrl() }));
						}
						setTimeout(() => {
							this.props.handleSubmit();
						}, 0);
					}}
					className="coinpayments-form"
				>
					<Input type="hidden" name="cmd" value="_pay" />
					<Input type="hidden" name="reset" value="1" />
					<Input type="hidden" name="merchant" value="46ed83339e6e0252cb80d762294470da" />
					<Input type="hidden" name="item_name" value="OnyxCash" />
					<Input type="hidden" name="currency" value="USD" />
					<Input type="hidden" name="amountf" value={this.props.amount} />
					<Input type="hidden" name="quantity" value="1" />
					<Input type="hidden" name="allow_quantity" value="0" />
					<Input type="hidden" name="want_shipping" value="0" />
					<Input type="hidden" name="first_name" value={this.props.user.firstName} />
					<Input type="hidden" name="last_name" value={this.props.user.lastName} />
					<Input type="hidden" name="email" value={this.props.user.email} />
					<Input type="hidden" name="ipn_url" value={backEndRestEndpoint + "/coinpayment"} />
					<Input type="hidden" name="allow_extra" value="0" />
					<Input
						className="coinpayments-form__input"
						type="image"
						src={CoinPaymentsPic}
						alt="Buy Now with CoinPayments.net"
					/>
				</form>
			</div>
		);
	}
}
