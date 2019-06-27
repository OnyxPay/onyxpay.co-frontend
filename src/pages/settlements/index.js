import React, { Component } from "react";
import { connect } from "react-redux";
import { PageTitle } from "../../components";
import Actions from "../../redux/actions";
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
