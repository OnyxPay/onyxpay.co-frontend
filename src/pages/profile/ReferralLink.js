import React, { Component } from "react";
import { Card, Typography, Steps, Button, Icon, Spin } from "antd";
import { BackendUrl } from "../../api/constants";
import PastePic from "../../assets/icons/paste.svg";

export function ReferralLink() {
	let referralCode = sessionStorage.getItem("OnyxAddr");
	return (
		<div>
			<h3>
				<b>Referral settings</b>
			</h3>
			<p>
				Referral link: <a>{BackendUrl + "?rcode=" + referralCode}</a>
				<input type="image" src={PastePic} style={{ marginLeft: 5, width: 16, height: 16 }} />
			</p>
		</div>
	);
}
