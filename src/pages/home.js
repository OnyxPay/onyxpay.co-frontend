import React from "react";
import { PageTitle, TransactonsTable, BalanceCard } from "../components";
import { Card, Row, Col } from "antd";

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
      <Card title="Recent Transactions">
        <TransactonsTable />
      </Card>
    </>
  );
};

export default Home;
