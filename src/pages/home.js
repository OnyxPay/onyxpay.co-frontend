import React from "react";
import { PageTitle, TransactonsTable, BalanceCard } from "../components";
import { Card, Row, Col } from "antd";
import Balance from "../components/balance/Balance";

export const Home = () => {
  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      <Row gutter={16}>
        <Col md={24} lg={8}>
          <BalanceCard label="OnyxCash available" amount="114,343.533" />
        </Col>
        <Col md={24} lg={8}>
          <BalanceCard label="OnyxCash available" amount="114,343.533" />
        </Col>
        <Col md={24} lg={8}>
          <BalanceCard label="OnyxCash available" amount="114,343.533" />
        </Col>
      </Row>
      <Balance />
      <Card title="Recent Transactions">
        <TransactonsTable />
      </Card>
    </>
  );
};

export default Home;
