import React from "react";
import styled from "styled-components";
import { Icon, Tooltip } from "antd";

const Container = styled.div`
	display: inline-block;
	text-align: center;
	padding-left: 10px;
	.wallet-icon,
	.download-icon {
		font-size: 35px;
		color: #40a9ff;
		cursor: pointer;
		transition: 0.3s all;
		&:hover {
			color: #1890ff;
		}
	}
`;

const AddWallet = ({ showImportWalletModal, wallet, clearWallet }) => {
	return (
		<Container>
			{wallet ? (
				<Tooltip title="Close wallet" placement="bottom">
					<Icon type="lock" className="wallet-icon" onClick={clearWallet} />
				</Tooltip>
			) : (
				<Tooltip title="Import wallet" placement="bottom">
					<Icon type="download" onClick={showImportWalletModal} className="download-icon" />
				</Tooltip>
			)}
		</Container>
	);
};

export default AddWallet;
