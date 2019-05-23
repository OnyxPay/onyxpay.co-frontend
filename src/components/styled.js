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
	background-position: ${p => p.bgPosition || "unset"};
`;

export const ErrorText = styled.div`
	color: #f5222d;
`;

export const Divider = styled.div`
	height: 1px;
	background-color: #d9d9d9;
	margin: ${p => p.margin || "24px 0"};
`;
