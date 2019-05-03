import React from "react";
import { Layout as AntLayout } from "antd";
import { Header, Footer, MainContent, Sidebar } from "../index";
import { withRouter } from "react-router-dom";

const Layout = ({ location, isSideBarCollapsed, toggleSidebar, simplified, children }) => {
	const onlyFooter = simplified.some(route => {
		return location.pathname === route;
	});

	return onlyFooter ? (
		<AntLayout className="main-layout">
			<AntLayout className="content-wrapper-simplified">
				<AntLayout>
					<MainContent>{children}</MainContent>
					<Footer />
				</AntLayout>
			</AntLayout>
		</AntLayout>
	) : (
		<AntLayout className="main-layout">
			<Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isSideBarCollapsed} />

			<AntLayout className={isSideBarCollapsed ? "content-wrapper collapsed" : "content-wrapper"}>
				<Sidebar collapsed={isSideBarCollapsed} />
				<AntLayout>
					<MainContent>{children}</MainContent>
					<Footer />
				</AntLayout>
			</AntLayout>
		</AntLayout>
	);
};

export default withRouter(Layout);
