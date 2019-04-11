import React from "react";
import { Card } from "antd";
import styled from "styled-components";

const Label = styled.div`
	margin-bottom: 5px;
`;
const Amount = styled.div`
	font-size: 36px;
	color: #374254;
	word-break: break-all;
`;

export const BalanceCard = ({ label, title, amount, extra }) => {
	return (
		<Card title={title} extra={extra} style={{ marginBottom: "24px" }}>
			<Label>{label}</Label>
			<Amount>{amount}</Amount>
		</Card>
	);
};
