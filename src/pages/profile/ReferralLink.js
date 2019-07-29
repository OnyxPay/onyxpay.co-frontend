import React, { useState } from "react";
import { Input, Icon, Button } from "antd";
import { BackendUrl } from "api/constants";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ShowQRCode from "components/modals/ShowQRCode";
import { showNotification } from "components/notification";

export default function ReferralLink() {
	const [isModalVisible, showModal] = useState(false);

	const referralCode = localStorage.getItem("OnyxAddr");
	const link = BackendUrl + "/login?rcode=" + referralCode;

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
							onCopy={() =>
								showNotification({
									type: "info",
									msg: "Referral link has been copied in the clipboard.",
								})
							}
						>
							<Icon type="copy" style={{ marginLeft: 5, width: 16, height: 16 }} />
						</CopyToClipboard>
					}
				/>
				<Button onClick={() => showModal(true)} className="btn-show-qrcode" type="primary">
					QR Code
				</Button>
			</div>
			<ShowQRCode link={link} isModalVisible={isModalVisible} hideModal={() => showModal(false)} />
		</div>
	);
}
