import React from "react";
import { Typography, Avatar, Tooltip } from "antd";
import styled from "styled-components";
const { Text } = Typography;

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	border-bottom: 1px solid rgba(167, 180, 201, 0.1);
	padding: 10px 20px;
	margin-bottom: 15px;
	.user-name-tooltip {
		display: flex;
		overflow: hidden;
		align-items: center;
	}
	.user-role {
		color: white;
		font-size: 13px;
		margin: 0;
	}
	.ant-typography {
		color: #fff;
		font-size: 18px;
		font-weight: 600;
		margin-left: 10px;
		margin-right: 10px;
	}
	.ant-avatar {
		background-color: #fff;
		color: #555;
		flex-shrink: 0;
	}
	@media (max-width: 480px) {
		.ant-avatar {
			width: 32px;
			height: 32px;
			line-height: 32px;
			font-size: 18px;
		}
	}
`;

export default function User({ firstName, lastName, role }) {
	if (firstName || lastName) {
		return (
			<Wrapper>
				<Tooltip
					title={
						<>
							<div>
								{firstName} {lastName}
							</div>
							<div>role: {role}</div>
						</>
					}
					placement="right"
					trigger="hover"
					className="user-name-tooltip"
				>
					<Avatar size="large" icon="user" />
					<Text ellipsis={true}>
						{firstName} {lastName}
						<p className="user-role">role: {role}</p>
					</Text>
				</Tooltip>
			</Wrapper>
		);
	} else {
		return null;
	}
}
