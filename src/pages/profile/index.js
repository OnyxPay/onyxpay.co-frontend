import React, { Component } from "react";
import { connect } from "react-redux";
import { Card } from "antd";
import { PageTitle } from "../../components";
import ReferralLink from "./ReferralLink";
import ProfileEditor from "./ProfileEditor";
import WalletAddress from "./WalletAddress";
import Actions from "../../redux/actions";
import SettlementCard from "../../pages/settlements/SettlementCard";
import DeleteAccount from "./DeleteAccount";
import SetFiatAmount from "./SetFiatAmount";

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
				<Card style={{ marginBottom: 24 }}>
					<SetFiatAmount />
				</Card>
				<DeleteAccount />
			</>
		);
	}
}

export default connect(
	null,
	{ getUserData: Actions.user.getUserData }
)(Profile);
