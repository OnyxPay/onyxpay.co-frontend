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

function getUpgradeMenuItem(linkRole, title, userRole) {
	if (
		userRole === roles.sa ||
		userRole === roles.adm ||
		userRole === roles.sadm ||
		userRole === roles.support
	) {
		return null;
	} else if (userRole === roles.a && linkRole === roles.a) {
		return null;
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

function getReferralLinkMenuItem(userRole) {
	if (userRole === roles.c || userRole === roles.a || userRole === roles.sa) {
		return (
			<Menu.Item>
				<Link to={"/referral-program"}>
					<UpgradeLink>Referral Program</UpgradeLink>
				</Link>
			</Menu.Item>
		);
	} else {
		return null;
	}
}

function getProfileLinkMenuItem(userRole) {
	if (userRole === roles.c || userRole === roles.a || userRole === roles.sa) {
		return (
			<Menu.Item>
				<Link to={"/profile"}>
					<UpgradeLink>Profile</UpgradeLink>
				</Link>
			</Menu.Item>
		);
	} else {
		return null;
	}
}

const DropdownMenu = ({ logOut, user }) => {
	let menu;
	if (user) {
		menu = (
			<Menu style={{ minWidth: 160 }}>
				{getUpgradeMenuItem("agent", "Upgrade to Agent", user.role)}
				{getUpgradeMenuItem("super_agent", "Upgrade to Super Agent", user.role)}
				{getReferralLinkMenuItem(user.role)}
				{getProfileLinkMenuItem(user.role)}
				<Menu.Divider />
				<Menu.Item onClick={() => logOut()}>
					<span>Logout</span>
				</Menu.Item>
			</Menu>
		);
	} else {
		return null;
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
