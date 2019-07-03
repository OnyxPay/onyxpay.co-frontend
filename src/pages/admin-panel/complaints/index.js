import React, { Component } from "react";
import { PageTitle } from "../../../components";
import ComplaintsList from "./ComplaintsList";

export default class Complaints extends Component {
	render() {
		return (
			<>
				<PageTitle>Complaints</PageTitle>
				<ComplaintsList />
			</>
		);
	}
}
