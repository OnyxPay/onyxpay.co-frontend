import React, { Component } from "react";
import { PageTitle } from "components";
import { Card } from "antd";
import ReferralsList from "components/paginated-list/ReferralsList";
import RewardedTransactionsList from "components/paginated-list/RewardedTransactionsList";
import ReferralReward from "./ReferralReward";

class ReferralProgram extends Component {
	render() {
		return (
			<>
				<div className="referral-page">
					<PageTitle>Referral Program Information</PageTitle>
					<ReferralReward />

					<Card title={"Referrals list"} className="card-table-container">
						<ReferralsList />
					</Card>

					<Card title={"Rewarded transactions list"} className="card-table-container">
						<RewardedTransactionsList />
					</Card>
				</div>
			</>
		);
	}
}

export default ReferralProgram;
