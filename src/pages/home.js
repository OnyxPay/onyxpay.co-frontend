import React from "react";
import { PageTitle, TransactonsTable } from "../components";
import { Card } from "antd";
import Balance from "../components/balance/Balance";

export const Home = () => {
	return (
		<>
			<PageTitle>Dashboard</PageTitle>
			<Balance />
			<Card title="Recent Transactions">
				<TransactonsTable />
			</Card>
		</>
	);
};

export default Home;
