import React from "react";
import { Input, Icon } from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { showNotification } from "components/notification";

export function WalletAddress() {
	let walletAddress = localStorage.getItem("OnyxAddr");
	return (
		<>
			<h3>
				<b>Your wallet address</b>
			</h3>
			<div>
				<Input
					addonBefore="Address:"
					value={walletAddress}
					style={{ border: "none" }}
					className="referral-link-input"
					suffix={
						<CopyToClipboard
							text={walletAddress}
							onCopy={() =>
								showNotification({
									type: "info",
									msg: "Wallet address has been copied to the clipboard",
								})
							}
						>
							<Icon type="copy" style={{ marginLeft: 5, width: 16, height: 16 }} />
						</CopyToClipboard>
					}
				/>
			</div>
		</>
	);
}
