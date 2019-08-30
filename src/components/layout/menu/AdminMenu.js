import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { Component } from "react";
import { compose } from "redux";
import { roles } from "api/constants";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class AdminMenu extends Component {
	render() {
		const { location, user } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/admin/users">
					<Link to="/admin/users" className="ant-menu-item-content">
						<Icon type="user" />
						<span>Users</span>
					</Link>
				</Menu.Item>
				{// assets management is available for super admin only
				user.role === roles.sadm ? (
					<Menu.Item key="/admin/assets">
						<Link to="/admin/assets" className="ant-menu-item-content">
							<Icon type="dollar" />
							<span>Assets</span>
						</Link>
					</Menu.Item>
				) : null}
				<SubMenu
					key="requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="pull-request" />
							<span>Requests</span>
						</span>
					}
				>
					{// account upgrade is available for super admin or admin
					user.role === roles.sadm || user.role === roles.adm ? (
						<Menu.Item key="/admin/requests/user-upgrade">
							<Link to="/admin/requests/user-upgrade" className="ant-menu-item-content">
								<span>Account upgrade</span>
							</Link>
						</Menu.Item>
					) : null}
					<Menu.Item key="/admin/requests/complaints">
						<Link to="/admin/requests/complaints" className="ant-menu-item-content">
							<span>Complaints</span>
						</Link>
					</Menu.Item>
					<Menu.Item key="/admin/requests/complaints/resolve">
						<Link to="/admin/requests/complaints/resolve" className="ant-menu-item-content">
							<span>Resolved Complaints</span>
						</Link>
					</Menu.Item>
				</SubMenu>

				{// dev options are available for super admin or admin
				user.role === roles.sadm || user.role === roles.adm
					? process.env.REACT_APP_TAG !== "prod" && (
							<Menu.Item key="/admin/dev">
								<Link to="/admin/dev" className="ant-menu-item-content">
									<Icon type="tool" />
									<span>Dev options</span>
								</Link>
							</Menu.Item>
					  )
					: null}
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
