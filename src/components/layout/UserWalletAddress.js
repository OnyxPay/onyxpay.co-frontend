import React, { Component } from "react";
import Actions from "../../redux/actions";
import { connect } from "react-redux";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { push } from "connected-react-router";
import { Icon, Tooltip, Avatar, Dropdown, Menu, Button } from "antd";
import { MyContext } from "./index";
import { showNotification } from "components/notification";
import { unlockWalletAccount } from "api/wallet";
import { generateTokenTimeStamp } from "utils";
import { signWithPk } from "utils/blockchain";
import RegistrationModal from "../../components/modals/Registration";
import { setDefaultAccountAddress } from "api/wallet";

const modals = {
	REGISTRATION_MODAL: "REGISTRATION_MODAL",
};

class UserWalletAddress extends Component {
	state = {
		REGISTRATION_MODAL: false,
		accountList: null,
	};

	showModal = type => () => {
		this.setState({ [type]: true });
	};

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	handleLogin = async currentAccountAddress => {
		const { push, login, getUserData, location, setWallet, wallet } = this.props;
		this.setState({ accountAddress: currentAccountAddress });
		try {
			const { pk, accountAddress, publicKey, password } = await unlockWalletAccount(
				currentAccountAddress
			);
			const tokenTimestamp = generateTokenTimeStamp();
			const signature = signWithPk(tokenTimestamp, pk);

			console.log({ publicKey, accountAddress, signed_msg: signature.serializeHex() });

			const currentWallet = await setDefaultAccountAddress(wallet, pk, password);
			setWallet(currentWallet);

			const res = await login({
				public_key: publicKey.key,
				signed_msg: signature.serializeHex(),
				walletAddr: accountAddress.value,
			});

			if (res && res.error) {
				if (res.error.data) {
					this.showModal(modals.REGISTRATION_MODAL)();
				}
			} else {
				await getUserData();

				if (location.state && location.state.redirectFrom) {
					push(location.state.redirectFrom);
				} else {
					push("/");
				}
			}
		} catch (er) { }
	};

	showAccountList = () => {
		const walletAddress = localStorage.getItem("OnyxAddr");
		const wallet = JSON.parse(localStorage.getItem("wallet"));
		let accountList = (
			<Menu className="account-list">
				{wallet.accounts.map(
					(account, index) =>
						account.address !== walletAddress && (
							<Menu.Item key={index}>
								<Button block type="primary" onClick={() => this.handleLogin(account.address)}>
									<MyContext.Consumer>
										{activeBreakPoint =>
											activeBreakPoint !== "sm" && activeBreakPoint !== "xs"
												? account.address
												: `${account.address.slice(0, 5)}...${account.address.slice(-5)}`
										}
									</MyContext.Consumer>
								</Button>
							</Menu.Item>
						)
				)}
			</Menu>
		);
		if (accountList.props.children.length === 1) {
			accountList = (
				<Menu className="account-list">
					<Menu.Item>
						<span>You have only one registered address</span>
					</Menu.Item>
				</Menu>
			);
		}
		this.setState({ accountList: accountList });
	};

	showWalletAddress = () => {
		const walletAddress = localStorage.getItem("OnyxAddr");
		const { accountList } = this.state;

		return (
			<>
				<Dropdown overlay={accountList} trigger={["click"]} onClick={() => this.showAccountList()}>
					<div>
						<Icon type="caret-down" />
						<MyContext.Consumer>
							{activeBreakPoint =>
								activeBreakPoint !== "sm" && activeBreakPoint !== "xs"
									? walletAddress
									: `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`
							}
						</MyContext.Consumer>
					</div>
				</Dropdown>
				<CopyToClipboard
					text={walletAddress}
					onCopy={() =>
						showNotification({
							type: "info",
							msg: "Wallet address has been copied to the clipboard",
						})
					}
				>
					<Icon type="copy" />
				</CopyToClipboard>
			</>
		);
	};

	render() {
		return (
			<>
				<MyContext.Consumer>
					{activeBreakPoint => {
						return (
							<div className="user-wallet-address-container">
								<>
									{activeBreakPoint !== "sm" && activeBreakPoint !== "xs" ? (
										<div className="wallet-address">{this.showWalletAddress()}</div>
									) : (
											<Tooltip
												title={<div className="wallet-address">{this.showWalletAddress()}</div>}
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
					}}
				</MyContext.Consumer>
				<RegistrationModal
					isModalVisible={this.state.REGISTRATION_MODAL}
					hideModal={this.hideModal(modals.REGISTRATION_MODAL)}
					selectedAccount={this.state.accountAddress}
				/>
			</>
		);
	}
}

export default connect(
	state => {
		return { location: state.router.location, wallet: state.wallet };
	},
	{
		login: Actions.auth.login,
		push,
		getUserData: Actions.user.getUserData,
		setWallet: Actions.wallet.setWallet,
	}
)(UserWalletAddress);
