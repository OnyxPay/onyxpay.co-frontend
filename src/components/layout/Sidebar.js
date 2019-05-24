import React from "react";
import { Layout } from "antd";

import UserSidebar from "./menu/UserSidebar";
import AgentSidebar from "./menu/AgentSidebar";
import SuperAdminSidebar from "./menu/SuperAdminSidebar";

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
			{user && user.role === "user" && <UserSidebar />}
			{user && user.role === "agent" && <AgentSidebar />}
			{user && user.role === "super admin" && <SuperAdminSidebar />}
		</Sider>
	);
}

export default Sidebar;
