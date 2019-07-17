import React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Icon, Tooltip } from "antd";
import styled from "styled-components";

const UserDataContainer = styled.div`
	margin-right: 30px;
	p {
		color: white;
		margin: 0;
		text-align: right;
	}
	hr {
		margin: 0;
	}
	.role {
		p {
			text-transform: capitalize;
		}
	}
	.wallet-address {
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

export const UserData = () => {
	const walletAddress = localStorage.getItem("OnyxAddr");
	const user = JSON.parse(localStorage.getItem("user"));
	const windowWidth = window.screen.width;

	return (
		<UserDataContainer>
			<div className="wallet-address">
				<p>
					{windowWidth > 640 ? (
						walletAddress
					) : (
						<Tooltip title={walletAddress} placement="bottomRight" trigger="click">
							<span>{walletAddress.substring(0, 2)} ...</span>
						</Tooltip>
					)}
					<CopyToClipboard text={walletAddress}>
						<Icon type="copy" />
					</CopyToClipboard>
				</p>
			</div>
			<hr />
			<div className="role">
				<p>{user.role}</p>
			</div>
		</UserDataContainer>
	);
};
