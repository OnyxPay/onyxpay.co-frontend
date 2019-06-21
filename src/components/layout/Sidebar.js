import React from "react";
import { Layout } from "antd";

import UserMenu from "./menu/UserMenu";
import AgentMenu from "./menu/AgentMenu";
import SuperAdminMenu from "./menu/SuperAdminMenu";
import { roles } from "../../api/constants";

const { Sider } = Layout;

// TODO:
// close sidebar on route change
// extract menu from sideBar

function Sidebar({ collapsed, location, user, xsDevise }) {
	return (
		<Sider
			className="sidebar"
			collapsible
			collapsed={collapsed}
			trigger={null}
			width="240"
			collapsedWidth={xsDevise ? "0" : "80"}
		>
			{user && user.role === roles.c && <UserMenu />}
			{((user && user.role === roles.a) || (user && user.role === roles.sa)) && <AgentMenu />}
			{user && user.role === roles.sadm && <SuperAdminMenu />}
		</Sider>
	);
}

export default Sidebar;
