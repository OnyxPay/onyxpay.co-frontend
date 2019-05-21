import React from "react";
import { Layout as AntLayout } from "antd";
import { HeaderComponent as Header } from "./Header";
import { MainContent } from "./MainContent";
//import Sidebar from "./Sidebar";
import { FooterComponent as Footer } from "./Footer";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import Menu from "./menu";

const MainLayout = styled.section`
	min-height: 100vh;
	display: flex;
	flex: auto;
	flex-direction: column;
`;

const Layout = ({ location, isSideBarCollapsed, toggleSidebar, simplified, children }) => {
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
			<Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isSideBarCollapsed} />

			<AntLayout className={isSideBarCollapsed ? "content-wrapper collapsed" : "content-wrapper"}>
				<Menu collapsed={isSideBarCollapsed} />
				<AntLayout>
					<MainContent>{children}</MainContent>
					<Footer />
				</AntLayout>
			</AntLayout>
		</AntLayout>
	);
};

export default withRouter(Layout);
