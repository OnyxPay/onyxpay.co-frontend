import React, { Component } from "react";
import { Input, Icon, message, Button } from "antd";
import { BackendUrl } from "api/constants";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ShowQRCode from "components/modals/ShowQRCode";

const modals = {
	ADD_SHOW_QR_CODE: "ADD_SHOW_QR_CODE",
};

export default class ReferralLink extends Component {
	state = {
		ADD_SHOW_QR_CODE: false,
	};

	showModalQRCode = type => () => {
		this.setState({ ADD_SHOW_QR_CODE: true });
	};

	hideModalQRCode = type => () => {
		this.setState({ ADD_SHOW_QR_CODE: false });
	};

	render() {
		const { ADD_SHOW_QR_CODE } = this.state;
		const referralCode = localStorage.getItem("OnyxAddr");
		const link = BackendUrl + "?rcode=" + referralCode;
		return (
			<div>
				<h3>
					<b>Referral info</b>
				</h3>
				<div className="referral-info">
					<Input
						addonBefore="Referral link:"
						value={link}
						style={{ border: "none" }}
						className="referral-link-input"
						suffix={
							<CopyToClipboard
								text={link}
								onCopy={() => message.info("Referral link already in the clipboard.", 5)}
							>
								<Icon type="copy" style={{ marginLeft: 5, width: 16, height: 16 }} />
							</CopyToClipboard>
						}
					/>
					<Button onClick={this.showModalQRCode()} className="btn-show-qrcode" type="primary">
						QR Code
					</Button>
				</div>
				<ShowQRCode
					link={link}
					isModalVisible={ADD_SHOW_QR_CODE}
					hideModal={this.hideModalQRCode(modals.ADD_SHOW_QR_CODE)}
				/>
			</div>
		);
	}
}
