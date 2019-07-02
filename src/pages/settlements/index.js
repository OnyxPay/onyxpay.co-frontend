import React, { Component } from "react";
import { PageTitle } from "../../components";
import SettlementCard from "./SettlementCard";

export default class Settlement extends Component {
	render() {
		return (
			<>
				<PageTitle>Settlement Accounts</PageTitle>
				<SettlementCard />
			</>
		);
	}
}
