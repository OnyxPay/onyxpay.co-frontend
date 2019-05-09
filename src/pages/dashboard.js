import React from "react";
import { PageTitle, TransactionsTable } from "../components";
import { Card } from "antd";
import Balance from "../components/balance/Balance";

const Home = () => {
	return (
		<>
			<PageTitle>Dashboard</PageTitle>
			<Balance />
			<Card title="Recent Transactions">
				<TransactionsTable />
			</Card>
		</>
	);
};

export default Home;
