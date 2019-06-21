import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Avatar, Menu, Dropdown } from "antd";
import { Link } from "react-router-dom";
import Actions from "../../redux/actions";

const UpgradeLink = styled.span`
	color: #1890ff;
`;

function getMenuItem(linkRole, title, userRole) {
	if (userRole === "superagent") {
		return;
	} else if (userRole === "agent" && linkRole === "agent") {
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
