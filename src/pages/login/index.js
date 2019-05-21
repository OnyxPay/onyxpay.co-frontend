import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "../../redux/actions";
import { UnderlayBg } from "../../components/styled";
import bgImg from "../../assets/img/bg/login.jpg";
import styled from "styled-components";
import { Typography, Button } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

const LoginCard = styled.div`
	border: 1px solid #e8e8e8;
	padding: 24px;
	position: relative;
	background: #fff;
	border-radius: 2px;
	transition: all 0.3s;
	min-width: 300px;
	position: absolute;
	right: 10%;
	top: 50%;
	transform: translateY(-50%);
	@media (max-width: 992px) {
		right: 50%;
		transform: translate(50%, -50%);
	}
`;

class Login extends Component {
	openDashboard = () => {
		this.props.saveUser({ name: "Lucas", role: "user" });
		this.props.history.push("/");
	};
	openAdminPanel = () => {
		this.props.saveUser({ name: "jon", role: "super admin" });
		this.props.history.push("/admin/investments");
	};

	render() {
		return (
			<UnderlayBg img={bgImg}>
				<LoginCard>
					<Title level={4} style={{ textAlign: "center", marginBottom: 24 }} type="secondary">
						Welcome to OnyxPay
					</Title>
					<Button block type="primary" style={{ marginBottom: 5 }}>
						<Link to={{ pathname: "/wallet-unlock", state: { from: "login" } }}>Login</Link>
					</Button>
					<Button block type="primary" style={{ marginBottom: 5 }}>
						<Link to={{ pathname: "/wallet-create", state: { from: "create_account" } }}>
							Create account
						</Link>
					</Button>
					<Button block onClick={this.openDashboard} type="danger">
						Open Dashboard
					</Button>
					<Button block onClick={this.openAdminPanel} type="danger">
						Enter asset admin
					</Button>
				</LoginCard>
			</UnderlayBg>
		);
	}
}

export default connect(
	null,
	{ saveUser: Actions.user.saveUser }
)(Login);
