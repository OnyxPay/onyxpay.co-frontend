// eslint-disable-next-line no-unused-vars
import React from "react";
import styled from "styled-components";

export const PageTitle = styled.h1`
	margin-bottom: 30px;
	padding-bottom: 13px;
	border-bottom: 1px solid rgba(167, 180, 201, 0.3);
	font-size: 26px;
`;

export const Container = styled.div`
	padding: 0 24px;
`;

export const UnderlayBg = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	background-size: cover;
	background-image: url(${p => p.img});
`;

export const ErrorText = styled.div`
	color: #f5222d;
`;
