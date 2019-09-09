// eslint-disable-next-line no-unused-vars
import React from "react";
import styled, { css } from "styled-components";
import { Tooltip, Icon } from "antd";
import pt from "prop-types";

export const StyledTitle = styled.h1`
	margin-bottom: 30px;
	padding-bottom: 13px;
	border-bottom: 1px solid rgba(167, 180, 201, 0.3);
	font-size: 26px;
	@media (max-width: 1199px) {
		padding-bottom: 5px;
	}
`;

export const PageTitle = ({ children, style, className, tooltip }) => {
	let content;
	if (tooltip) {
		content = (
			<Tooltip title={tooltip.title} placement="bottom">
				{children}
				<Icon type="info-circle" style={{ marginLeft: 5, fontSize: 22 }} />
			</Tooltip>
		);
	} else {
		content = children;
	}

	return (
		<StyledTitle style={style} className={className}>
			{content}
		</StyledTitle>
	);
};

PageTitle.propTypes = {
	tooltip: pt.shape({ title: pt.oneOfType([pt.string, pt.element]) }),
};

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

export const FormWrapper = styled.div`
	margin-bottom: 1rem;
`;

export const TextAligner = styled.div`
	text-align: ${p => p.align || "center"};

	${p => {
		return (
			p.mobile &&
			css`
				@media (max-width: 700px) {
					text-align: ${p => p.mobile};
				}
			`
		);
	}}
`;
