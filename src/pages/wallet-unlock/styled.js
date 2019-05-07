import React from "react";
import styled from "styled-components";
import { Button, Icon } from "antd";
import { Link } from "react-router-dom";

export const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

export const Card = styled.div`
	margin-top: 120px;
	margin-bottom: 30px;
	width: 850px;
	@media (max-width: 992px) {
		margin-top: 0;
		width: 100%;
	}
`;

export const SelectContainer = styled.div`
	@media (min-width: 993px) {
		display: none;
	}
`;

export const CardBody = styled.div`
	box-shadow: rgb(228, 228, 228) 0px 0px 10px;
	background: rgb(255, 255, 255);
	padding: 40px 60px;
`;

export const UnlockTitle = styled.div`
	font-size: 16px;
	font-weight: bold;
	margin-top: 20px;
	@media (max-width: 992px) {
		margin-bottom: 15px;
	}
`;

const FormButtonsGroup = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const linkDisabled = {
	pointerEvents: "none",
	cursor: "default",
	color: "rgba(0, 0, 0, 0.25)",
};
export const FormButtons = ({ isSubmitting }) => {
	return (
		<FormButtonsGroup>
			<Link to="/registration" style={isSubmitting ? linkDisabled : {}}>
				Create a new wallet
			</Link>
			<Button type="primary" htmlType="submit" disabled={isSubmitting} loading={isSubmitting}>
				Unlock wallet
				<Icon type="right" />
			</Button>
		</FormButtonsGroup>
	);
};
