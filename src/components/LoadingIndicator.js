import React from "react";
import styled from "styled-components";
import loaderSvg from "../assets/icons/loader.svg";
// import { Spin } from "antd";

const Bg = styled.div`
	position: fixed;
	z-index: 10000;
	background-color: rgba(255, 255, 255);
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const LoadingIndicator = () => {
	return (
		<Bg>
			<img src={loaderSvg} alt="loader" />
		</Bg>
	);
};
