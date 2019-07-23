import React, { Component } from "react";
import { connect } from "react-redux";
import { Layout as AntLayout } from "antd";
import { HeaderComponent as Header } from "./Header";
import { MainContent } from "./MainContent";
import Sidebar from "./Sidebar";
import { FooterComponent as Footer } from "./Footer";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { debounce } from "lodash";
import { compose } from "redux";

const MainLayout = styled.section`
	min-height: 100vh;
	display: flex;
	flex: auto;
	flex-direction: column;
`;

class Layout extends Component {
	constructor(props) {
		super(props);
		this.checkWindowWidth = debounce(this.checkWindowWidth.bind(this), 200);

		this.state = {
			xsDevise: this.isXsWidth(),
			isSideBarCollapsed: this.isXsWidth(),
		};
	}

	componentDidMount() {
		this.checkWindowWidth();
		window.addEventListener("resize", this.checkWindowWidth);
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			prevProps.location.pathname !== this.props.location.pathname &&
			this.state.xsDevise &&
			!this.state.isSideBarCollapsed
		) {
			this.toggleSidebar(); // hide menu on route change
		}
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.checkWindowWidth);
	}

	checkWindowWidth() {
		const { xsDevise } = this.state;
		if (window.innerWidth <= 575 && !xsDevise) {
			this.setState({ xsDevise: true, isSideBarCollapsed: true });
		} else if (window.innerWidth > 575 && xsDevise) {
			this.setState({ xsDevise: false });
		}
	}

	isXsWidth() {
		return window.innerWidth <= 575;
	}

	toggleSidebar = () => {
		this.setState({
			isSideBarCollapsed: !this.state.isSideBarCollapsed,
		});
	};

	render() {
		const { location, simplified, children, user } = this.props;
		const { xsDevise, isSideBarCollapsed } = this.state;
		const onlyFooter = simplified.some(route => {
			return location.pathname === route;
		});

		return onlyFooter ? (
			<MainLayout>
				<MainContent noPadding>{children}</MainContent>
				<Footer />
			</MainLayout>
		) : (
			<AntLayout className="main-layout">
				<Header toggleSidebar={this.toggleSidebar} isSidebarCollapsed={isSideBarCollapsed} />

				<AntLayout className={isSideBarCollapsed ? "content-wrapper collapsed" : "content-wrapper"}>
					<Sidebar
						collapsed={isSideBarCollapsed}
						xsDevise={xsDevise}
						user={user}
						location={location}
						toggleSidebar={this.toggleSidebar}
					/>
					<AntLayout>
						<MainContent>{children}</MainContent>
						<Footer />
					</AntLayout>
				</AntLayout>
			</AntLayout>
		);
	}
}

function mapStateToProps(state) {
	return {
		user: state.user,
	};
}

Layout = compose(
	withRouter,
	connect(mapStateToProps)
)(Layout);

export default Layout;
