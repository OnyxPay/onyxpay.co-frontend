import React, { Component } from "react";
import { PageTitle } from "../../../components";
import AssetsList from "./assetsList";
import AssetsList from "./AssetsList";

export default class Assets extends Component {
	render() {
		return (
			<>
				<PageTitle>Assets</PageTitle>
				<AssetsList />
			</>
		);
	}
}
