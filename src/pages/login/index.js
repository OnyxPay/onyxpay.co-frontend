import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Typography, Button, message } from "antd";
import { push } from "connected-react-router";
import styled from "styled-components";
import Actions from "../../redux/actions";
import { UnderlayBg, Divider } from "../../components/styled";
import bgImg from "../../assets/img/bg/login.jpg";
import AddWallet from "./AddWallet";
import { unlockWalletAccount } from "../../api/wallet";
import ImportWalletModal from "../../components/modals/wallet/ImportWalletModal";
import CreateWalletModal from "../../components/modals/wallet/CreateWalletModal";
import RegistrationModal from "../../components/modals/Registration";

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
	top: 50%;
	transform: translateY(-50%);
	@media (max-width: 992px) {
		right: 50%;
		transform: translate(50%, -50%);
	}
	@media (max-width: 575px) {
		width: auto;
		min-width: 300px;
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

	openAdminPanel = () => {
		this.props.saveUser({ name: "jon", role: "super admin" });
		this.props.history.push("/admin/investments");
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
		const { clearWallet, logOut } = this.props;
		clearWallet();
		logOut(true);
		message.success("You successfully closed your wallet", 5);
	};

	handleLogin = async () => {
		const { push, login, getUserData } = this.props;
		this.setState({ loading: true });
		try {
			const { /* pk, accountAddress, */ publicKey } = await unlockWalletAccount();
			const res = await login({ public_key: publicKey });
			/*
				TODO:
				if token is expired show error
			*/

			if (res && res.error) {
				if (res.error.data) {
					// not valid credentials
					message.error("Invalid credentials, maybe, this wallet  is not registered", 5);
				}
			} else {
				await getUserData();
				push("/");
			}
		} catch (er) {
			console.log(er);
		} finally {
			if (this._isMounted) {
				this.setState({ loading: false });
			}
		}
	};

	isAuthenticated() {
		const { user, authenticated } = this.props;
		return user && authenticated;
	}

	render() {
		const { wallet, logOut } = this.props;
		const { loading } = this.state;
		return (
			<UnderlayBg img={bgImg} bgPosition={"20% 20%"}>
				<LoginCard>
					<Title
						level={2}
						style={{ textAlign: "center", margin: "0 0 5px 0", fontWeight: 400 }}
						type="secondary"
					>
						Welcome to OnyxPay
					</Title>
					<Title
						level={3}
						style={{ textAlign: "center", margin: 0, fontWeight: 400 }}
						type="secondary"
					>
						{wallet ? "Close your wallet" : "Import or create wallet"}
						<AddWallet
							showImportWalletModal={this.showModal(modals.IMPORT_WALLET_MODAL)}
							wallet={wallet}
							clearWallet={this.handleClearWallet}
						/>
					</Title>
					<Divider />
					{this.isAuthenticated() ? (
						<div>
							<Button onClick={logOut} block style={{ marginBottom: 5 }}>
								Logout
							</Button>
							<Button block>
								<Link to="/">Open Dashboard</Link>
							</Button>
						</div>
					) : (
						<div>
							<Button
								block
								type="primary"
								style={{ marginBottom: 5 }}
								disabled={!wallet || loading}
								loading={loading}
								onClick={this.handleLogin}
							>
								Login
							</Button>

							<Button
								block
								type="primary"
								style={{ marginBottom: 5 }}
								disabled={!wallet}
								onClick={this.showModal(modals.REGISTRATION_MODAL)}
							>
								Create account
							</Button>
							<Button block onClick={this.openAdminPanel} type="danger">
								Enter asset admin
							</Button>
						</div>
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
					/>
				</LoginCard>
			</UnderlayBg>
		);
	}
}

export default connect(
	state => {
		return { wallet: state.wallet, user: state.user, authenticated: state.auth.token };
	},
	{
		saveUser: Actions.user.saveUser,
		clearWallet: Actions.wallet.clearWallet,
		unlockWallet: Actions.walletUnlock.showWalletUnlockModal,
		login: Actions.auth.login,
		push,
		getUserData: Actions.user.getUserData,
		logOut: Actions.auth.logOut,
	}
)(Login);
