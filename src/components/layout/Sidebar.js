import React from "react";
import { Layout, Menu, Icon } from "antd";
import { Link } from "react-router-dom";

const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

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
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/">
					<Link to="/" className="ant-menu-item-content">
						<Icon type="dashboard" />
						<span>Dashboard</span>
					</Link>
				</Menu.Item>

				{user && user.role === "user" && (
					<SubMenu
						key="operations"
						title={
							<span className="ant-menu-item-content">
								<Icon type="interation" />
								<span>Assets</span>
							</span>
						}
					>
						<Menu.Item key="/deposit">
							<Link to="/deposit">Deposit</Link>
						</Menu.Item>
						<Menu.Item key="/send">
							<Link to="/send">Send</Link>
						</Menu.Item>
						<Menu.Item key="/withdraw">
							<Link to="/withdraw">Withdraw</Link>
						</Menu.Item>
					</SubMenu>
				)}

				{((user && user.role === "agent") || (user && user.role === "super agent")) && (
					<SubMenu
						key="OnyxCash (agent)"
						title={
							<span className="ant-menu-item-content">
								<Icon type="interation" />
								<span>OnyxCash</span>
							</span>
						}
					>
						<Menu.Item key="/deposit:agent">
							<Link to="/deposit:agent">Deposit / buy OnyxCash</Link>
						</Menu.Item>
					</SubMenu>
				)}

				<SubMenu
					key="active-requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="team" />
							<span>Active requests</span>
						</span>
					}
				>
					<Menu.Item key="323">User active requests</Menu.Item>
					<Menu.Item key="3dasd">Agent active requests</Menu.Item>
				</SubMenu>

				<Menu.Item key="/settlement-accounts">
					<Link to="/settlement-accounts" className="ant-menu-item-content">
						<Icon type="pay-circle" />
						<span>Settlement accounts</span>
					</Link>
				</Menu.Item>

				<Menu.Item key="/messages">
					<Link to="/messages" className="ant-menu-item-content">
						<Icon type="mail" />
						<span>Messages</span>
					</Link>
				</Menu.Item>
			</Menu>
		</Sider>
	);
}

export default Sidebar;
