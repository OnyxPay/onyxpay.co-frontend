import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Icon, Tooltip } from "antd";
import styled from "styled-components";

const UserWalletContainer = styled.div`
	margin-right: 30px;
	p {
		color: white;
		margin: 0;
		text-align: right;
	}
	.wallet-address {
		height: 100%;
		display: flex;
		align-items: center;
		i {
			margin-left: 5px;
			width: 16px;
			height: 16px;
		}
	}
	@media (max-width: 640px) {
		.wallet-address {
			span {
				padding: 0 10px;
			}
		}
	}
	@media (max-width: 380px) {
		margin-right: 5px;
	}
`;

export const UserWalletAddress = () => {
	const walletAddress = localStorage.getItem("OnyxAddr");
	const windowWidth = window.screen.width;

	return (
		<UserWalletContainer>
			<div className="wallet-address">
				<p>
					{windowWidth > 640 ? (
						walletAddress
					) : (
						<Tooltip
							title={walletAddress}
							placement="bottomRight"
							overlayClassName="wallet-address-tooltip"
							trigger="click"
						>
							<span>{walletAddress.substring(0, 2)} ...</span>
						</Tooltip>
					)}
					<CopyToClipboard text={walletAddress}>
						<Icon type="copy" />
					</CopyToClipboard>
				</p>
			</div>
		</UserWalletContainer>
	);
};
