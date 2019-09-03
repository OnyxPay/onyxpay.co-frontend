import React, { useState } from "react";
import { Input, Icon, Button, Typography } from "antd";
import { BackendUrl } from "api/constants";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ShowQRCode from "components/modals/ShowQRCode";
import { showNotification } from "components/notification";

const { Text } = Typography;

export default function ReferralLink() {
	const [isModalVisible, showModal] = useState(false);

	const referralCode = localStorage.getItem("OnyxAddr");
	const link = BackendUrl + "/login?rcode=" + referralCode;

	return (
		<div>
			<h3>
				<b>Referral information</b>
			</h3>
			<Text>
				Share and earn: share a referral link to invite new members. You will receive a reward each
				time OnyxPay Agent from your invitees handles Withdraw or Deposit transaction.
			</Text>
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
