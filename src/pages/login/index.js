import React, { Component } from "react";
import { UnderlayBg } from "../../components/styled";
import bgImg from "../../assets/img/bg/login.jpg";
import styled from "styled-components";
import { Card, Typography, Button } from "antd";

const { Title } = Typography;

class Login extends Component {
	render() {
		return (
			<UnderlayBg img={bgImg}>
				``
				<Card
					style={{
						width: 300,
						position: "absolute",
						right: "10%",
						top: "50%",
						transform: "translateY(-50%)",
					}}
				>
					<Title level={4}>Login to your account</Title>
					<Button block type="primary">
						Login
					</Button>
				</Card>
			</UnderlayBg>
		);
	}
}

export default Login;
