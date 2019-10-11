import React, { Component } from "react";
import { connect } from "react-redux";
import { Typography, Button, List, Popconfirm } from "antd";
import { push } from "connected-react-router";
import styled from "styled-components";
import Actions from "../../redux/actions";
import { UnderlayBg } from "../../components/styled";
import bgImg from "../../assets/img/bg/login.jpg";
import { unlockWalletAccount } from "../../api/wallet";
import ImportWalletModal from "../../components/modals/wallet/ImportWalletModal";
import CreateWalletModal from "../../components/modals/wallet/CreateWalletModal";
import RegistrationModal from "../../components/modals/Registration";
import { generateTokenTimeStamp } from "../../utils";
import { signWithPk } from "../../utils/blockchain";
import { showNotification } from "components/notification";
import { isBase58Address } from "../../utils/validate";
import queryString from "query-string";
import { Redirect } from "react-router-dom";
import { setDefaultAccountAddress } from "api/wallet";

const { Title } = Typography;

const modals = {
	IMPORT_WALLET_MODAL: "IMPORT_WALLET_MODAL",
	CREATE_WALLET_MODAL: "CREATE_WALLET_MODAL",
	REGISTRATION_MODAL: "REGISTRATION_MODAL",
};

const LoginCard = styled.div`
	border: 1px solid #e8e8e8;
	padding: 24px;
	position: relative;
	background: #fff;
	border-radius: 2px;
	transition: all 0.3s;
	width: 380px;
	position: absolute;
	right: 10%;
	top: 40%;
	transform: translateY(-150%);
	@media (max-width: 992px) {
		right: 50%;
		transform: translate(50%, -170%);
	}
	@media (max-width: 575px) {
		width: auto;
		min-width: 300px;
		h2 {
			font-size: 24px !important;
		}
	}
`;

const AccountListCard = styled.div`
	border: 1px solid #e8e8e8;
	padding: 24px 0;
	background: #fff;
	border-radius: 2px;
	transition: all 0.3s;
	width: 380px;
	position: absolute;
	right: -1px;
	top: 105px;
	text-align: center;
	h4 {
		margin: 0 !important;
		font-size: 18px !important;
	}
	.ant-list-item {
		justify-content: space-between;
		h4 {
			width: 53%;
			text-align: left;
		}
		button {
			width: 42%;
		}
	}
	.ant-list-items {
		max-height: 170px;
		overflow: auto;
		padding: 0 24px;
	}
	.close-wallet {
		font-size: 20px;
		background: none;
		color: grey;
		border: none;
		outline: none;
		box-shadow: none;
		position: absolute;
		right: 0px;
		top: 0px;
	}
	@media (max-width: 992px) {
		left: 0;
	}
	@media (max-width: 575px) {
		width: auto;
		top: 95px;
		min-width: 300px;
		h4 {
			font-size: 14px !important;
		}
		.ant-list-item {
			h4 {
				width: 45%;
			}
			button {
				width: 53%;
			}
		}
	}
`;

class Login extends Component {
	state = {
		IMPORT_WALLET_MODAL: false,
		CREATE_WALLET_MODAL: false,
		REGISTRATION_MODAL: false,
		loading: false,
	};

	componentDidMount() {
		this._isMounted = true;
		let params = queryString.parse(this.props.location.search);
		if (!!params.rcode && isBase58Address(params.rcode)) {
			localStorage.setItem("rcode", params.rcode);
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	hideModal = type => () => {
		this.setState({ [type]: false });
	};

	showModal = type => () => {
		this.setState({ [type]: true });
	};

	switchModal = to => () => {
		if (to === modals.CREATE_WALLET_MODAL) {
			this.hideModal(modals.IMPORT_WALLET_MODAL)();
			this.showModal(modals.CREATE_WALLET_MODAL)();
		} else {
			this.hideModal(modals.CREATE_WALLET_MODAL)();
			this.showModal(modals.IMPORT_WALLET_MODAL)();
		}
	};

	handleClearWallet = () => {
		const { clearWallet, logOut, user } = this.props;
		console.log("handleClearWallet", user);
		clearWallet();
		if (user) {
			logOut();
		} else {
			logOut(false);
		}
		showNotification({
			type: "success",
			msg: "You successfully closed your wallet",
		});
	};

	handleLogin = async currentAccountAddress => {
		const { push, login, getUserData, location, wallet, setWallet } = this.props;
		this.setState({ loading: true, accountAddress: currentAccountAddress });
		try {
			const { pk, accountAddress, publicKey, password } = await unlockWalletAccount(
				currentAccountAddress
			);
			const tokenTimestamp = generateTokenTimeStamp();
			const signature = signWithPk(tokenTimestamp, pk);

			console.log({ publicKey, accountAddress, signed_msg: signature.serializeHex() });

			const currentWallet = await setDefaultAccountAddress(wallet, pk, password);
			setWallet(currentWallet);
			localStorage.setItem("OnyxAddr", accountAddress)

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
		} catch (er) {
		} finally {
			if (this._isMounted) {
				this.setState({ loading: false });
			}
		}
	};

	isAuthenticated() {
		const { user } = this.props;
		return user ? true : false;
	}

	render() {
		const { wallet } = this.props;
		const { loading, accountAddress } = this.state;
		const regularLabel = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

		return (
			<UnderlayBg img={bgImg} bgPosition={"20% 20%"}>
				<LoginCard>
					{this.isAuthenticated() ? (
						<Redirect to={{ pathname: "/" }} />
					) : (
							<>
								<Title
									level={2}
									style={{ textAlign: "center", margin: "0 0 5px 0", fontWeight: 400 }}
									type="secondary"
								>
									Welcome to OnyxPay
							</Title>
								<AccountListCard>
									{wallet && (
										<Popconfirm
											title={`Are you sure to close the wallet?`}
											okText="Yes"
											cancelText="No"
											onConfirm={() => this.handleClearWallet()}
										>
											<Button type="primary" className="close-wallet">
												x
										</Button>
										</Popconfirm>
									)}
									<Title level={4} type="secondary">
										Wallet
								</Title>
									{wallet ? (
										<List
											dataSource={wallet.accounts}
											split={false}
											renderItem={account => (
												<>
													<List.Item>
														<Title ellipsis={true} level={4} type="secondary">
															{account.label.match(regularLabel) === null
																? account.label
																: `${account.address.slice(0, 5)}...${account.address.slice(-5)}`}
														</Title>
														<Button
															type="primary"
															disabled={!wallet || (loading && accountAddress === account.address)}
															loading={loading && accountAddress === account.address}
															onClick={() => this.handleLogin(account.address)}
														>
															Log in/Sign up
													</Button>
													</List.Item>
												</>
											)}
										/>
									) : (
											<Title level={4} type="secondary">
												Empty wallet
									</Title>
										)}
									<div style={{ marginTop: 10, paddingLeft: 24, paddingRight: 24 }}>
										<Button block type="primary" onClick={this.showModal(modals.CREATE_WALLET_MODAL)}>
											Add address
									</Button>
										<Button
											style={{ marginTop: 5 }}
											block
											type="primary"
											onClick={this.showModal(modals.IMPORT_WALLET_MODAL)}
										>
											Import address
									</Button>
									</div>
								</AccountListCard>
							</>
						)}

					<ImportWalletModal
						isModalVisible={this.state.IMPORT_WALLET_MODAL}
						hideModal={this.hideModal(modals.IMPORT_WALLET_MODAL)}
						switchModal={this.switchModal(modals.CREATE_WALLET_MODAL)}
					/>
					<CreateWalletModal
						isModalVisible={this.state.CREATE_WALLET_MODAL}
						hideModal={this.hideModal(modals.CREATE_WALLET_MODAL)}
						switchModal={this.switchModal(modals.IMPORT_WALLET_MODAL)}
					/>
					<RegistrationModal
						isModalVisible={this.state.REGISTRATION_MODAL}
						hideModal={this.hideModal(modals.REGISTRATION_MODAL)}
						selectedAccount={this.state.accountAddress}
					/>
				</LoginCard>
			</UnderlayBg>
		);
	}
}

export default connect(
	state => {
		return { wallet: state.wallet, user: state.user, location: state.router.location };
	},
	{
		saveUser: Actions.user.saveUser,
		clearWallet: Actions.wallet.clearWallet,
		unlockWallet: Actions.walletUnlock.showWalletUnlockModal,
		login: Actions.auth.login,
		push,
		getUserData: Actions.user.getUserData,
		logOut: Actions.auth.logOut,
		setWallet: Actions.wallet.setWallet,
	}
)(Login);
