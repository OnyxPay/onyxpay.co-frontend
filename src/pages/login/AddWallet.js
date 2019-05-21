import React from "react";
import styled from "styled-components";
import { Icon, Tooltip } from "antd";
import { ReactComponent as WalletSvg } from "../../assets/icons/wallet.svg";
import { ReactComponent as DownloadSvg } from "../../assets/icons/download.svg";

const Container = styled.div`
	display: inline-block;
	text-align: center;
	.wallet-icon,
	.download-icon {
		font-size: 35px;
		color: #40a9ff;
		cursor: pointer;
		transition: 0.3s all;
		&:hover {
			transform: scale(1.1);
		}
	}
`;

const AddWallet = ({ showImportWalletModal, wallet, clearWallet }) => {
	return (
		<Container>
			{wallet ? (
				<Tooltip title="Close wallet" placement="bottom">
					<Icon component={WalletSvg} onClick={clearWallet} className="wallet-icon" />
				</Tooltip>
			) : (
				<Tooltip title="Import wallet" placement="bottom">
					<Icon component={DownloadSvg} onClick={showImportWalletModal} className="download-icon" />
				</Tooltip>
			)}
		</Container>
	);
};

export default AddWallet;
