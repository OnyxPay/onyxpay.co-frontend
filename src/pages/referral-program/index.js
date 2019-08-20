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
				<div>
					<PageTitle>Referral Program Info</PageTitle>
					<ReferralReward />

					<Card title={"Referrals list"} style={{ marginTop: "1em" }}>
						<ReferralsList />
					</Card>

					<Card title={"Rewarded transactions list"} style={{ marginTop: "1em" }}>
						<RewardedTransactionsList />
					</Card>
				</div>
			</>
		);
	}
}

export default ReferralProgram;
