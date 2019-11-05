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

export const MyContext = React.createContext(null);

class Layout extends Component {
	constructor(props) {
		super(props);
		this.checkWindowWidth = debounce(this.checkWindowWidth.bind(this), 200);

		this.state = {
			activeBreakPoint: this.getActiveBreakPoint(),
			isSideBarCollapsed: this.getActiveBreakPoint() === "xs",
		};
	}

	componentDidMount() {
		this.checkWindowWidth();
		window.addEventListener("resize", this.checkWindowWidth);
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			prevProps.location.pathname !== this.props.location.pathname &&
			this.state.activeBreakPoint === "xs" &&
			!this.state.isSideBarCollapsed
		) {
			this.toggleSidebar(); // hide menu on route change
		}
		if (!this.state.isSideBarCollapsed && this.state.activeBreakPoint === "xs") {
			document.body.style.overflow = "hidden";
		} else if (this.state.isSideBarCollapsed && this.state.activeBreakPoint === "xs") {
			document.body.style.overflow = "unset";
		}
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.checkWindowWidth);
	}

	checkWindowWidth() {
		const bp = this.getActiveBreakPoint();
		this.setState({ activeBreakPoint: bp });
		if (bp === "xs") {
			this.setState({ isSideBarCollapsed: true });
		}
	}

	getActiveBreakPoint() {
		const width = window.innerWidth;
		if (width <= 575) {
			return "xs";
		} else if (width < 768 && width >= 576) {
			return "sm";
		} else if (width < 992 && width >= 768) {
			return "md";
		} else if (width < 1200 && width >= 992) {
			return "lg";
		} else if (width < 1600 && width >= 1200) {
			return "xl";
		} else if (width >= 1600) {
			return "xxl";
		}
	}

	toggleSidebar = () => {
		this.setState({
			isSideBarCollapsed: !this.state.isSideBarCollapsed,
		});
	};

	render() {
		const { location, simplified, children, user } = this.props;
		const { isSideBarCollapsed, activeBreakPoint } = this.state;
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
				<MyContext.Provider value={activeBreakPoint}>
					<Header toggleSidebar={this.toggleSidebar} isSidebarCollapsed={isSideBarCollapsed} />
					<AntLayout
						className={isSideBarCollapsed ? "content-wrapper collapsed" : "content-wrapper"}
					>
						<Sidebar
							collapsed={isSideBarCollapsed}
							xsDevise={activeBreakPoint === "xs"}
							user={user}
							location={location}
							toggleSidebar={this.toggleSidebar}
						/>
						<AntLayout>
							<MainContent>{children}</MainContent>
							<Footer />
						</AntLayout>
					</AntLayout>
				</MyContext.Provider>
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
