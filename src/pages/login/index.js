import React, { Component } from "react";
import { UnderlayBg } from "../../components/styled";
import bgImg from "../../assets/img/bg/login.jpg";
import styled from "styled-components";
import { Typography, Button, Icon } from "antd";
import { Link } from "react-router-dom";
import { ReactComponent as NewUserSvg } from "../../assets/icons/new-user.svg";

const { Title, Text } = Typography;

const LinksBlock = styled.div`
	margin: 15px 0;
	text-align: center;
`;

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

const IconBox = styled.span`
	i {
		font-size: 16px;
		padding-right: 5px;
	}
`;

class Login extends Component {
	render() {
		return (
			<UnderlayBg img={bgImg}>
				<LoginCard>
					<Title level={4}>Login to your account</Title>
					<Button block type="primary">
						Login
					</Button>
					<LinksBlock>
						<Text>Don't have account yet?</Text>
						<div>
							<IconBox>
								<Icon component={NewUserSvg} />
							</IconBox>
							<Link to="/registration">Create Customer Account</Link>
						</div>
						<div>
							<IconBox>
								<Icon component={NewUserSvg} />
							</IconBox>
							<Link to="/registration">Create Agent Account</Link>
						</div>
						<div>
							<IconBox>
								<Icon component={NewUserSvg} />
							</IconBox>
							<Link to="/registration">Create Super Agent Account</Link>
						</div>
					</LinksBlock>
				</LoginCard>
			</UnderlayBg>
		);
	}
}

export default Login;
