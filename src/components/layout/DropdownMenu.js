import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Avatar, Menu, Dropdown } from "antd";
import { Link } from "react-router-dom";
import Actions from "../../redux/actions";
import { roles } from "../../api/constants";

const UpgradeLink = styled.span`
	color: #1890ff;
`;

const AvatarContainer = styled.div`
	.ant-avatar {
		background-color: #fff;
		color: #555;
		cursor: pointer;
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

function getMenuItem(linkRole, title, userRole) {
	if (
		userRole === roles.sa ||
		userRole === roles.adm ||
		userRole === roles.sadm ||
		userRole === roles.support
	) {
		return;
	} else if (userRole === roles.a && linkRole === roles.a) {
		return;
	} else {
		return (
			<Menu.Item>
				<Link to={"/upgrade-user:" + linkRole}>
					<UpgradeLink>{title}</UpgradeLink>
				</Link>
			</Menu.Item>
		);
	}
}

const DropdownMenu = ({ logOut, user }) => {
	let menu;
	if (user) {
		menu = (
			<Menu style={{ minWidth: 160 }}>
				{getMenuItem("agent", "Upgrade to Agent", user.role)}
				{getMenuItem("super_agent", "Upgrade to Super Agent", user.role)}
				<Menu.Item>
					<Link to={"/profile"}>
						<UpgradeLink>Profile</UpgradeLink>
					</Link>
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item onClick={() => logOut()}>
					<span>Logout</span>
				</Menu.Item>
			</Menu>
		);
	}

	return (
		<Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
			<AvatarContainer>
				<Avatar size="large" icon="user" />
			</AvatarContainer>
		</Dropdown>
	);
};

export default connect(
	state => {
		return {
			user: state.user,
		};
	},
	{
		logOut: Actions.auth.logOut,
	}
)(DropdownMenu);
