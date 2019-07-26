import { Icon, Menu } from "antd";
import { Link, withRouter } from "react-router-dom";
import React, { Component } from "react";
import { compose } from "redux";
import connect from "react-redux/es/connect/connect";

const SubMenu = Menu.SubMenu;

class SupportMenu extends Component {
	render() {
		const { location } = this.props;
		return (
			<Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
				<Menu.Item key="/admin/users">
					<Link to="/admin/users" className="ant-menu-item-content">
						<Icon type="user" />
						<span>Users</span>
					</Link>
				</Menu.Item>
				<SubMenu
					key="active-requests"
					title={
						<span className="ant-menu-item-content">
							<Icon type="team" />
							<span>Customer requests</span>
						</span>
					}
				>
					<Menu.Item key="/active-requests/deposit">
						<Link to="/active-requests/deposit">Active deposit requests</Link>
					</Menu.Item>
					<Menu.Item key="/active-requests/withdraw">
						<Link to="/active-requests/withdraw">Active withdraw requests</Link>
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

SupportMenu = compose(
	withRouter,
	connect(mapStateToProps)
)(SupportMenu);

export default SupportMenu;
