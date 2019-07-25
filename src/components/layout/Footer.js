import React from "react";
import styled from "styled-components";

const Footer = styled.footer`
	flex: 0 0 auto;
	background: #fff;
	border-top: 1px solid rgba(167, 180, 201, 0.3);
	font-size: 14px;
	padding: 1.25rem 1rem;
	color: #a7b4c9;
	text-align: center;
	a {
		color: #1f252d;
	}
`;

export const FooterComponent = () => {
	return (
		<Footer>
			Copyright © 2019{" "}
			<a href="https://www.onyxpay.co" target="_blank" rel="noopener noreferrer">
				OnyxPay
			</a>
			,{" "}
			<a href="https://wallet.onyxpay.co" target="_blank" rel="noopener noreferrer">
				Wallet
			</a>{" "}
			| Powered by{" "}
			<a href="https://onyxcoin.io/" target="_blank" rel="noopener noreferrer">
				OnyxCoin
			</a>{" "}
			| All trademarks Licensed to <strong>Kwakoo Marketplace</strong>&nbsp; rights reserved.
		</Footer>
	);
};
