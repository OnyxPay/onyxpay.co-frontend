import React, { Component } from "react";
import { Input } from "antd";
import { backEndRestEndpoint } from "../../api/constants";
import CoinPaymentsPic from "../../assets/icons/CoinPayments.png";

export class CoinPaymentsForm extends Component {
	handleSubmit(event) {
		event.preventDefault();
		this.props.handleSubmit();
		event.target.submit();
	}

	render() {
		this.handleSubmit = this.handleSubmit.bind(this);
		return (
			<div>
				<form
					action="https://www.coinpayments.net/index.php"
					method="post"
					target="_blank"
					onSubmit={this.handleSubmit}
				>
					<Input type="hidden" name="cmd" value="_pay" />
					<Input type="hidden" name="reset" value="1" />
					<Input type="hidden" name="merchant" value="46ed83339e6e0252cb80d762294470da" />
					<Input type="hidden" name="item_name" value="USD" />
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
						type="image"
						src={CoinPaymentsPic}
						alt="Buy Now with CoinPayments.net"
						style={{
							textAlign: "left",
							width: 186,
							height: 79,
							borderStyle: "solid",
							float: "left",
							marginRight: 5,
							marginTop: 5,
						}}
					/>
				</form>
			</div>
		);
	}
}
