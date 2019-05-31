import React from "react";
import styled from "styled-components";
import { Icon, Tooltip, Popconfirm } from "antd";
import { ReactComponent as WalletSvg } from "../../assets/icons/wallet.svg";

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
					<Popconfirm
						icon={<Icon type="question-circle-o" />}
						title="Are you sure to close the wallet?"
						onConfirm={clearWallet}
					>
						<Icon component={WalletSvg} className="wallet-icon" />
					</Popconfirm>
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
