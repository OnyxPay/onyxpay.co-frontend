import React, { Component } from "react";
import { PageTitle } from "components";
import { getReferralsList } from "api/referral";
import { Table } from "antd";

class ReferralProgram extends Component {
	state = {
		referralsList: [],
	};

	componentDidMount = async () => {
		const referrals = await getReferralsList();
		this.setState({ referralsList: referrals.items });
	};

	render() {
		let referralsTableColumns = [
			{
				title: "First name",
				dataIndex: "firstName",
				key: "firstName",
				render: firstName => (firstName ? firstName : "n/a"),
			},
			{
				title: "Last name",
				dataIndex: "lastName",
				key: "lastName",
				render: lastName => (lastName ? lastName : "n/a"),
			},
			{
				title: "Registration date",
				dataIndex: "registrationDate",
				key: "registrationDate",
				render: registrationDate =>
					registrationDate ? new Date(registrationDate).toLocaleString() : "n/a",
			},
			{
				title: "Address",
				dataIndex: "addr",
				key: "addr",
				render: addr => (addr ? addr : "n/a"),
			},
		];

		return (
			<>
				<div>
					<PageTitle>Referral Program Info</PageTitle>
					<Table
						columns={referralsTableColumns}
						rowKey={record => record.user_id}
						dataSource={this.state.referralsList}
					/>
				</div>
			</>
		);
	}
}

export default ReferralProgram;
