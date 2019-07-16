import React from "react";
import { Typography, Avatar } from "antd";
import styled from "styled-components";
const { Text } = Typography;

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	border-bottom: 1px solid rgba(167, 180, 201, 0.1);
	padding: 10px 25px;
	margin-bottom: 15px;
`;

export default function User({ firstName, lastName }) {
	return (
		<Wrapper>
			<Avatar
				size="small"
				icon="user"
				style={{ backgroundColor: "#fff", color: "#555", flexShrink: 0 }}
			/>
			<Text
				ellipsis={true}
				style={{ color: "#fff", fontSize: "18px", fontWeight: 600, marginLeft: "10px" }}
			>
				{firstName} {lastName}
			</Text>
		</Wrapper>
	);
}
