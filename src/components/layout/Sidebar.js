import React from "react";
import { Layout } from "antd";

import UserMenu from "./menu/UserMenu";
import AgentMenu from "./menu/AgentMenu";
import SuperAdminMenu from "./menu/SuperAdminMenu";

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
			{user && user.role === "client" && <UserMenu />}
			{/* {(user && user.role === "agent") || (user && user.role === "super_agent" && <AgentMenu />)} */}
			{((user && user.role === "agent") || (user && user.role === "super_agent")) && <AgentMenu />}
			{user && user.role === "super_admin" && <SuperAdminMenu />}
		</Sider>
	);
}

export default Sidebar;
