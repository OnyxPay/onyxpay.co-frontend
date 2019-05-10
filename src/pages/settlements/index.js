import React, { Component } from "react";
import { Typography } from "antd";
import { Card, CardBody } from "../wallet-unlock/styled";
import { PageTitle } from "../../components";
import * as axios from "axios";

const { Title } = Typography;

class Settlement extends Component {
	state = {
		settlements: [],
	};

	componentDidMount() {
		const newUser = {
			first_name: "first_name",
			last_name: "last_name ",
			phone: "phone",
			email: "email",
			country_id: "country_id",
			password: "password",
		};

		axios.post(`http://preprod.onyxcoin.io/api/v1/sign-up`, { newUser }).then(res => {
			console.log(res);
			console.log(res.data);
		});
	}

	// handle = var => {};

	render() {
		return (
			<>
				<PageTitle>Settlement Accounts</PageTitle>
				<Card>
					<CardBody>
						<Title level={3} style={{ textAlign: "center" }}>
							Card Title
						</Title>
						Card Body
					</CardBody>
				</Card>
			</>
		);
	}
}

export default Settlement;
