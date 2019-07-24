import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Icon, Tooltip, Avatar } from "antd";
import { MyContext } from "./index";
import { showNotification } from "components/notification";

export default function UserWalletAddress() {
	const walletAddress = localStorage.getItem("OnyxAddr");
	const showWalletAddress = () => {
		return (
			<>
				<span>{walletAddress}</span>
				<CopyToClipboard
					text={walletAddress}
					onCopy={() =>
						showNotification({
							type: "info",
							msg: "Wallet address has been copied to the clipboard",
						})
					}
				>
					<Icon type="copy" />
				</CopyToClipboard>
			</>
		);
	};

	return (
		<>
			<MyContext.Consumer>
				{activeBreakPoint => {
					return (
						<div className="user-wallet-address-container">
							<>
								{activeBreakPoint !== "sm" && activeBreakPoint !== "xs" ? (
									<div className="wallet-address">{showWalletAddress()}</div>
								) : (
									<Tooltip
										title={<div className="wallet-address">{showWalletAddress()}</div>}
										placement="bottomRight"
										overlayClassName="wallet-address-tooltip"
										trigger="click"
									>
										<Avatar
											icon="wallet"
											size="large"
											style={{ backgroundColor: "#fff", color: "#555", flexІhrink: 0 }}
										/>
									</Tooltip>
								)}
							</>
						</div>
					);
				}}
			</MyContext.Consumer>
		</>
	);
}
