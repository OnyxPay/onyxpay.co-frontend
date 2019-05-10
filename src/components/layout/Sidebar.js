import React from "react";
import { Layout, Menu, Icon } from "antd";
import { Link, withRouter } from "react-router-dom";
import { debounce } from "lodash";
import { compose } from "redux";
import { connect } from "react-redux";

const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

// TODO: fix lock body scroll on mobile devises
// close sidebar on route change
// extract menu from sideBar
class Sidebar extends React.Component {
	constructor(props) {
		super(props);
		this.checkWindowWidth = debounce(this.checkWindowWidth.bind(this), 200);
		this.state = {
			xsDevise: false,
		};
	}

	checkWindowWidth() {
		const { xsDevise } = this.state;
		if (window.innerWidth <= 575 && !xsDevise) {
			this.setState({ xsDevise: true });
		} else if (window.innerWidth > 575 && xsDevise) {
			this.setState({ xsDevise: false });
		}
	}

	componentDidMount() {
		this.checkWindowWidth();
		window.addEventListener("resize", this.checkWindowWidth);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.checkWindowWidth);
	}

	render() {
		const { collapsed, location, user } = this.props;
		const { xsDevise } = this.state;

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

					<Menu.Item key="/login">
						<Link to="/login" className="ant-menu-item-content">
							<span>login</span>
						</Link>
					</Menu.Item>
				</Menu>
			</Sider>
		);
	}
}

// export const SideBarContainer = withRouter(Sidebar);
function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

Sidebar = compose(
	withRouter,
	connect(mapStateToProps)
)(Sidebar);

export default Sidebar;
