import React from "react";
import { Card, Typography } from "antd";
import styled from "styled-components";
// const { Title } = Typography;

const Label = styled.div`
  margin-bottom: 5px;
`;
const Amount = styled.div`
  font-size: 36px;
  color: #374254;
  word-break: break-all;
`;

export const BalanceCard = ({ label, amount }) => {
  return (
    <Card title="Float Available" style={{ marginBottom: "24px" }}>
      <Label>{label}</Label>
      <Amount>{amount}</Amount>
    </Card>
  );
};
