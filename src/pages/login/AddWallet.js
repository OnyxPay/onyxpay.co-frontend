import React from "react";
import styled from "styled-components";
import { Icon, Tooltip } from "antd";
import { ReactComponent as WalletSvg } from "../../assets/icons/wallet.svg";
import { ReactComponent as UploadSvg } from "../../assets/icons/upload.svg";

const Container = styled.div`
	display: inline-block;
	text-align: center;
	.wallet-icon,
	.upload-icon {
		font-size: 35px;
		color: #40a9ff;
		cursor: pointer;
		transition: 0.3s all;
		&:hover {
			transform: scale(1.1);
		}
	}
`;

const AddWallet = () => {
	return (
		<Container>
			{/* <Icon component={WalletSvg} className="wallet-icon" /> */}
			<Tooltip title="add wallet" placement="bottom">
				<Icon component={UploadSvg} className="upload-icon" />
			</Tooltip>
		</Container>
	);
};

export default AddWallet;
