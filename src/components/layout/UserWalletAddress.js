import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Icon, Tooltip, Avatar } from "antd";
import { MyContext } from "./index";

export default function UserWalletAddress() {
	const walletAddress = localStorage.getItem("OnyxAddr");
	return (
		<>
			<MyContext.Consumer>
				{activeBreakPoint => {
					return (
						<div className="user-wallet-address-container">
							<>
								{activeBreakPoint !== "sm" && activeBreakPoint !== "xs" ? (
									<div className="wallet-address">
										<span>{walletAddress}</span>
										<CopyToClipboard text={walletAddress}>
											<Icon type="copy" />
										</CopyToClipboard>
									</div>
								) : (
									<Tooltip
										title={
											<div className="wallet-address">
												<span>{walletAddress}</span>
												<CopyToClipboard text={walletAddress}>
													<Icon type="copy" />
												</CopyToClipboard>
											</div>
										}
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
