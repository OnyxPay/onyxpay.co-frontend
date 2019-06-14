import React, { Component } from "react";
import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class UserMenu extends Component {
	render() {
		const { location } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/">
					<Link to="/" className="ant-menu-item-content">
						<Icon type="dashboard" />
						<span>Dashboard</span>
					</Link>
				</Menu.Item>
				<SubMenu
					key="operations"
					title={
						<span className="ant-menu-item-content">
							<Icon type="interaction" />
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
				<SubMenu
					key="active-requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="pull-request" />
							<span>Requests</span>
						</span>
					}
				>
					<Menu.Item key="/active-requests">
						<Link to="/active-requests">Active requests</Link>
					</Menu.Item>
					<Menu.Item key="/closed-requests">
						<Link to="/closed-requests">Closed requests</Link>
					</Menu.Item>
				</SubMenu>

				<Menu.Item key="/exchange">
					<Link to="/exchange" className="ant-menu-item-content">
						<Icon type="wallet" />
						<span>Assets Exchange</span>
					</Link>
				</Menu.Item>

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
				<SubMenu
					key="users"
					title={
						<span className="ant-menu-item-content">
							<Icon type="user" />
							<span>Users</span>
						</span>
					}
				>
					<Menu.Item key="/admin/users">
						<Link to="/admin/users">Users</Link>
					</Menu.Item>
					<Menu.Item>
						<Link to="/admin/users/active">Active/Blocked users</Link>
					</Menu.Item>
				</SubMenu>
			</Menu>
		);
	}
}

function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

UserMenu = compose(
	withRouter,
	connect(mapStateToProps)
)(UserMenu);

export default UserMenu;
