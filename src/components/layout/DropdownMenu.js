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

function getMenuItem(linkRole, title, userRole) {
	if (userRole === roles.sa) {
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

const DropdownMenu = ({ logOut }) => {
	let user = JSON.parse(sessionStorage.getItem("user"));
	let menu;
	if (user) {
		menu = (
			<Menu>
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
			<Avatar
				size="large"
				icon="user"
				style={{ backgroundColor: "#fff", color: "#555", cursor: "pointer" }}
			/>
		</Dropdown>
	);
};

export default connect(
	null,
	{
		logOut: Actions.auth.logOut,
	}
)(DropdownMenu);
