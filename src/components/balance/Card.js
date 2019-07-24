import React from "react";
import { Card } from "antd";
import styled from "styled-components";

const Amount = styled.div`
	font-size: 34px;
	color: #374254;
	word-break: break-all;
`;

const AssetLabel = styled.span`
	font-weight: 500;
`;

export const BalanceCard = ({ title, amount = 0, extra, assetLabel }) => {
	return (
		<Card title={title} extra={extra} style={{ marginBottom: "24px" }}>
			<Amount>{amount}</Amount>
			<AssetLabel>(in {assetLabel} equivalent)</AssetLabel>
		</Card>
	);
};
