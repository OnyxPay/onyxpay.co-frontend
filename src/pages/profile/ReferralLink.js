import React from "react";
import { Input, Icon, message } from "antd";
import { BackendUrl } from "../../api/constants";
import { CopyToClipboard } from "react-copy-to-clipboard";

export function ReferralLink() {
	let referralCode = sessionStorage.getItem("OnyxAddr");
	const link = BackendUrl + "?rcode=" + referralCode;
	return (
		<div>
			<h3>
				<b>Referral settings</b>
			</h3>
			<p>
				<Input
					addonBefore="Referral link:"
					value={link}
					style={{ border: "none" }}
					suffix={
						<CopyToClipboard
							text={link}
							onCopy={() => message.info("Referral link already in the clipboard.", 5)}
						>
							<Icon type="copy" style={{ marginLeft: 5, width: 16, height: 16 }} />
						</CopyToClipboard>
					}
				/>
			</p>
		</div>
	);
}
