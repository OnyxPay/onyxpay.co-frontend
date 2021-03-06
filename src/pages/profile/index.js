import React, { Component } from "react";
import { Card } from "antd";
import { PageTitle } from "../../components";
import ReferralLink from "./ReferralLink";
import ProfileEditor from "./ProfileEditor";
import WalletAddress from "./WalletAddress";
import SettlementCard from "../../pages/settlements/SettlementCard";
import DeleteAccount from "./DeleteAccount";

class Profile extends Component {
	render() {
		return (
			<>
				<PageTitle>User profile</PageTitle>
				<Card style={{ marginBottom: 24 }}>
					<WalletAddress />
				</Card>
				<Card style={{ marginBottom: 24 }}>
					<ReferralLink />
				</Card>
				<Card style={{ marginBottom: 24 }}>
					<ProfileEditor />
				</Card>
				<SettlementCard />
				<DeleteAccount />
			</>
		);
	}
}

export default Profile;
