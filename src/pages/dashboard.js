import React from "react";
import { PageTitle, TransactionsTable } from "../components";
import { Card } from "antd";
import Balance from "../components/balance/Balance";
import ConfirmEmailModal from "../components/modals/ConfirmEmail";

const Home = () => {
	return (
		<>
			<PageTitle>Dashboard</PageTitle>
			<Balance />
			<Card title="Recent Transactions">
				<TransactionsTable />
			</Card>
			<ConfirmEmailModal isModalVisible={true} />
		</>
	);
};

export default Home;
