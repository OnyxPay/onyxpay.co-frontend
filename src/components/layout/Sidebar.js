import React from "react";
import { Layout, Menu, Icon } from "antd";
import { Link, withRouter } from "react-router-dom";
import { debounce } from "lodash";

const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

// TODO: fix lock body scroll on mobile devises
// close sidebar on route change
class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.checkWindowWidth = debounce(this.checkWindowWidth.bind(this), 200);
    this.state = {
      xsDevise: false
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
    const { collapsed, location } = this.props;
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
        {/* <div className="logo" style={{ padding: "30px" }} /> */}
        <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
          <Menu.Item key="/">
            <Link to="/">
              <Icon type="pie-chart" />
              <span>Dashboard</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/agents">
            <Link to="/agents">
              <Icon type="desktop" />
              <span>Agents</span>
            </Link>
          </Menu.Item>
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type="user" />
                <span>User</span>
              </span>
            }
          >
            <Menu.Item key="3">Tom</Menu.Item>
            <Menu.Item key="4">Bill</Menu.Item>
            <Menu.Item key="5">Alex</Menu.Item>
          </SubMenu>
          <SubMenu
            key="sub2"
            title={
              <span>
                <Icon type="team" />
                <span>Team</span>
              </span>
            }
          >
            <Menu.Item key="6">Team 1</Menu.Item>
            <Menu.Item key="8">Team 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="9">
            <Icon type="file" />
            <span>File</span>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}

export const SideBarContainer = withRouter(Sidebar);
