import React, { Component } from "react";
import { connect } from "react-redux";
import { Card } from "antd";
import { PageTitle } from "../../components";
import { ReferralLink } from "./ReferralLink";
import ProfileEditor from "./ProfileEditor";
import Actions from "../../redux/actions";
import SettlementCard from "../../pages/settlements/SettlementCard";

class Profile extends Component {
	render() {
		return (
			<>
				<PageTitle>User profile</PageTitle>
				<Card style={{ marginBottom: 24 }}>{ReferralLink()}</Card>
				<Card style={{ marginBottom: 24 }}>
					<ProfileEditor />
				</Card>
				<SettlementCard />
			</>
		);
	}
}

export default connect(
	null,
	{ getUserData: Actions.user.getUserData }
)(Profile);
