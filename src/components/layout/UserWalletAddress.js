import React, { Component } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Icon, Tooltip, Avatar } from "antd";
import { debounce } from "lodash";

export default class UserWalletAddress extends Component {
	constructor(props) {
		super(props);
		this.checkWindowWidth = debounce(this.checkWindowWidth.bind(this), 200);

		this.state = {
			xsDevise: this.isXsWidth(),
		};
	}

	componentDidMount() {
		this.checkWindowWidth();
		window.addEventListener("resize", this.checkWindowWidth);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.checkWindowWidth);
	}

	checkWindowWidth() {
		const { xsDevise } = this.state;
		if (window.innerWidth < 640 && !xsDevise) {
			this.setState({ xsDevise: true });
		} else if (window.innerWidth > 640 && xsDevise) {
			this.setState({ xsDevise: false });
		}
	}

	isXsWidth() {
		return window.innerWidth < 640;
	}

	walletAddress = localStorage.getItem("OnyxAddr");

	render() {
		const { xsDevise } = this.state;
		return (
			<div className="user-wallet-address-container">
				<>
					{!xsDevise ? (
						<div className="wallet-address">
							<span>{this.walletAddress}</span>
							<CopyToClipboard text={this.walletAddress}>
								<Icon type="copy" />
							</CopyToClipboard>
						</div>
					) : (
						<Tooltip
							title={
								<div className="wallet-address">
									<span>{this.walletAddress}</span>
									<CopyToClipboard text={this.walletAddress}>
										<Icon type="copy" />
									</CopyToClipboard>
								</div>
							}
							placement="bottomRight"
							overlayClassName="wallet-address-tooltip"
							trigger="click"
						>
							<Avatar
								icon="wallet"
								size="large"
								style={{ backgroundColor: "#fff", color: "#555", flexІhrink: 0 }}
							/>
						</Tooltip>
					)}
				</>
			</div>
		);
	}
}
