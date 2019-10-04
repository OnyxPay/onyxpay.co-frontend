import React from "react";
import styled from "styled-components";
import { Button, Icon } from "antd";

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

export const SelectContainer = styled.div`
	@media (min-width: 993px) {
		display: none;
	}
`;

export const ImportTitle = styled.div`
	font-size: 16px;
	font-weight: bold;
	margin-top: 20px;
	@media (max-width: 992px) {
		margin-bottom: 15px;
	}
`;

export const FormButtonsGroup = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
`;

export const PrivateText = styled.div`
	background: rgb(249, 249, 249);
	border: 1px dashed rgb(216, 216, 216);
	padding: 15px;
	margin-bottom: ${p => (p.mb ? p.mb : "auto")};
`;

export const MnemonicsText = styled.div`
	font-size: 18px;
	word-spacing: 6px;
	font-weight: 500;
`;

export const PkText = styled.div`
	word-break: break-all;
	font-size: 16px;
	font-weight: 500;
`;

export const Label = styled.div`
	margin-bottom: 5px;
`;

export const BackupTitle = styled.div`
	font-size: 16px;
	font-weight: 500;
	margin-bottom: 10px;
	color: #cf1322;
`;

export const WalletCreatedContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

export const WalletCreatedText = styled.div`
	margin-top: 30px;
	font-size: 20px;
	text-align: center;
`;

export const FormButtons = ({ isSubmitting, type, switchModal }) => {
	if (type && type === "create") {
		return (
			<FormButtonsGroup>
				<Button
					type="link"
					disabled={isSubmitting}
					onClick={switchModal}
					style={{ paddingLeft: 0 }}
				>
					Use existing wallet
				</Button>
				<Button type="primary" htmlType="submit" disabled={isSubmitting} loading={isSubmitting}>
					Download wallet file
					<Icon type="arrow-right" />
				</Button>
			</FormButtonsGroup>
		);
	} else {
		return (
			<FormButtonsGroup>
				<Button type="primary" htmlType="submit" disabled={isSubmitting} loading={isSubmitting}>
					Import wallet
					<Icon type="arrow-right" />
				</Button>
			</FormButtonsGroup>
		);
	}
};
