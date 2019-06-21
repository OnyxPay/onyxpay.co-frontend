import React from "react";
import { Card } from "antd";
import styled from "styled-components";

const Amount = styled.div`
	font-size: 34px;
	color: #374254;
	word-break: break-all;
`;

const AssetLabel = styled.span`
	color: #f07141;
	font-size: 18px;
	font-weight: 500;
	text-transform: uppercase;
`;

export const BalanceCard = ({ title, amount = 0, extra, assetLabel }) => {
	return (
		<Card title={title} extra={extra} style={{ marginBottom: "24px" }}>
			<AssetLabel>{assetLabel}</AssetLabel>
			<Amount>{amount}</Amount>
		</Card>
	);
};
