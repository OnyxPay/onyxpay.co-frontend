// eslint-disable-next-line no-unused-vars
import React from "react";
import styled, { css } from "styled-components";

export const MainContent = styled.main`
	flex: auto;
	min-height: 360px;
	position: relative;

	${p =>
		!p.noPadding &&
		css`
			position: static;
			padding: 30px;
			@media (max-width: 575px) {
				padding: 15px;
			}
		`}
`;
