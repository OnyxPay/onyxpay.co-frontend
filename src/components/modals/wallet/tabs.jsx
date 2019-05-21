import React from "react";
import { number, array, object, oneOfType, func } from "prop-types";
import styled from "styled-components";

const TabsContainer = styled.div`
	display: flex;
	padding-top: 30px;
	@media (max-width: 992px) {
		flex-direction: column;
	}
`;

const TabsNav = styled.div`
	width: 35%;
	border-right: 1px solid rgb(234, 236, 239);
	padding-right: 40px;
	margin-right: 40px;
	@media (max-width: 992px) {
		display: none;
	}
`;

const TabList = styled.div``;

const TabItem = styled.div`
	cursor: pointer;
	padding: 5px 5px 5px 20px;
	border: 1px solid transparent;
	border-radius: 3px;
	transition: all 0.3s;
	&:hover {
		background-color: #1890ff;
	}
	&.active {
		border-color: #1890ff;
	}
`;

const TabLabel = styled.span`
	font-size: 14px;
`;

const TabContent = styled.div`
	width: 65%;
	@media (max-width: 992px) {
		width: 100%;
	}
`;

const Tab = ({ position, value, onChange, children }) => {
	return (
		<TabItem className={value === position && "active"} onClick={() => onChange(position)}>
			{children}
		</TabItem>
	);
};

Tab.propTypes = {
	value: number,
	position: number,
	onChange: func,
};

const Tabs = ({ children, value, onChange }) => {
	return (
		<TabList>
			{React.Children.map(children, (child, index) => {
				return React.cloneElement(child, {
					value: value,
					onChange: onChange,
					position: index,
				});
			})}
		</TabList>
	);
};

Tabs.propTypes = {
	value: number,
	position: number,
	children: oneOfType([array, object]),
	onChange: func,
};

export { Tab, TabContent, TabsContainer, TabLabel, TabsNav };
export default Tabs;
