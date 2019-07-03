import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { Component } from "react";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class AdminMenu extends Component {
	render() {
		const { location } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/admin/investments">
					<Link to="/admin/investments" className="ant-menu-item-content">
						<Icon type="pay-circle" />
						<span>Investments</span>
					</Link>
				</Menu.Item>
				<Menu.Item key="/admin/users">
					<Link to="/admin/users" className="ant-menu-item-content">
						<Icon type="user" />
						<span>Users</span>
					</Link>
				</Menu.Item>

				<SubMenu
					key="requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="pull-request" />
							<span>Requests</span>
						</span>
					}
				>
					<Menu.Item key="/admin/requests/user-upgrade">
						<Link to="/admin/requests/user-upgrade" className="ant-menu-item-content">
							<span>Account upgrade</span>
						</Link>
					</Menu.Item>
				</SubMenu>
				<SubMenu
					key="complaints"
					title={
						<span className="ant-menu-item-content">
							<Icon type="highlight" />
							<span>Complaints</span>
						</span>
					}
				>
					<Menu.Item key="/admin/complaints/creat">
						<Link to="/admin/complaints/creat" className="ant-menu-item-content">
							<span>Complaints</span>
						</Link>
					</Menu.Item>
					<Menu.Item key="/admin/complaints/resolve">
						<Link to="/admin/complaints/resolve" className="ant-menu-item-content">
							<span>Resolved Complaints</span>
						</Link>
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

AdminMenu = compose(
	withRouter,
	connect(mapStateToProps)
)(AdminMenu);

export default AdminMenu;
