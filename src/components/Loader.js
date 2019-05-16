import React from "react";
import styled from "styled-components";
import { ReactComponent as LoaderSvg } from "../assets/icons/loader.svg";

const Bg = styled.div`
	position: fixed;
	z-index: 10000;
	background-color: transparent;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
`;

// TODO: better error display
export const Loader = ({ error, pastDelay, ...rest }) => {
	console.log(error, pastDelay, rest);
	if (error) {
		return <div>Oh no, something went wrong!</div>;
	} else if (pastDelay) {
		return (
			<Bg>
				<LoaderSvg />
			</Bg>
		);
	} else {
		return null;
	}
};
