import React, { Component } from "react";
import { PageTitle } from "components";
import { Divider } from "antd";
import ReferralsList from "components/paginated-list/ReferralsList";
import RewardedTransactionsList from "components/paginated-list/RewardedTransactionsList";

class ReferralProgram extends Component {
	state = {
		// referralsList: [],
	};

	componentDidMount = async () => {
		// const referrals = await getReferralsList();
		// this.setState({ referralsList: referrals.items });
	};

	render() {
		return (
			<>
				<div>
					<PageTitle>Referral Program Info</PageTitle>
					<Divider>Referrals list</Divider>
					<ReferralsList />
					<Divider>Rewarded transactions List</Divider>
					<RewardedTransactionsList />
				</div>
			</>
		);
	}
}

export default ReferralProgram;
