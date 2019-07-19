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
			xsDevise: this.isXsWidth(),
			activeBreakPoint: "xs",
			isSideBarCollapsed: this.isXsWidth(),
		};
	}

	componentDidMount() {
		this.checkWindowWidth();
		window.addEventListener("resize", this.checkWindowWidth);
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
		} else if (window.innerWidth < 768 && window.innerWidth >= 576) {
			this.setState({ activeBreakPoint: "sm" });
		} else if (window.innerWidth < 992 && window.innerWidth >= 768) {
			this.setState({ activeBreakPoint: "md" });
		} else if (window.innerWidth < 1200 && window.innerWidth >= 992) {
			this.setState({ activeBreakPoint: "lg" });
		} else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
			this.setState({ activeBreakPoint: "xl" });
		} else if (window.innerWidth >= 1600) {
			this.setState({ activeBreakPoint: "xxl" });
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
		const { xsDevise, isSideBarCollapsed, activeBreakPoint } = this.state;
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
				</MyContext.Provider>
				<AntLayout className={isSideBarCollapsed ? "content-wrapper collapsed" : "content-wrapper"}>
					<Sidebar
						collapsed={isSideBarCollapsed}
						xsDevise={xsDevise}
						user={user}
						location={location}
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
