import React from "react";
import { Layout } from "antd";
import UserMenu from "./menu/UserMenu";
import AgentMenu from "./menu/AgentMenu";
import AdminMenu from "./menu/AdminMenu";
import { roles } from "../../api/constants";
import User from "./User";

const { Sider } = Layout;

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
			{user ? <User firstName={user.firstName} lastName={user.lastName} /> : null}
			<div style={{ marginBottom: 15 }}>
				{user && user.role === roles.c && <UserMenu />}
				{((user && user.role === roles.a) || (user && user.role === roles.sa)) && (
					<AgentMenu role={user.role} />
				)}
				{user && user.role === roles.sadm && <AdminMenu />}
			</div>
		</Sider>
	);
}

export default Sidebar;
