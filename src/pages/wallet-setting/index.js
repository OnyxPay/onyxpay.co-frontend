import React, { Component } from "react";
import { Input, Icon, Button, Table } from "antd";
import { PageTitle } from "../../components";
import { connect } from "react-redux";
import styled from "styled-components";
import ImportWalletModal from "../../components/modals/wallet/ImportWalletModal";
import CreateWalletModal from "../../components/modals/wallet/CreateWalletModal";
import DeleteWalletAccount from "../../components/modals/DeleteWalletAccount";
import { saveAs } from "file-saver";

const InputContainer = styled.div`
	width: 100%;
	position: relative;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	input {
		padding-right: 50px;
	}
	.save-btn {
		position: absolute;
		right: 10px;
		top: 5px;
	}
`;

const ButtonContainer = styled.div`
	margin-bottom: 10px;
	button {
		margin-right: 10px;
		margin-bottom: 5px;
	}
`;

const modals = {
	IMPORT_WALLET_MODAL: "IMPORT_WALLET_MODAL",
	CREATE_WALLET_MODAL: "CREATE_WALLET_MODAL",
	DELETE_WALLET_ACCOUNT: "DELETE_WALLET_ACCOUNT",
};

class WalletSetting extends Component {
	constructor(props) {
		super(props);
		this.state = {
			IMPORT_WALLET_MODAL: false,
			CREATE_WALLET_MODAL: false,
			REGISTRATION_MODAL: false,
			DELETE_WALLET_ACCOUNT: false,
			wallet: null,
			editAccountAddress: null,
			showBtn: false,
			currentLabel: null,
			walletAccounts: null,
			pagination: { current: 1, pageSize: 20 },
			deleteAddress: null,
		};
	}

	componentDidMount = () => {
		const wal = JSON.parse(localStorage.getItem("wallet"));
		this.setState({ wallet: wal, walletAccounts: wal.accounts });
	};

	componentDidUpdate = (prevProps, prevState) => {
		const { CREATE_WALLET_MODAL, IMPORT_WALLET_MODAL } = this.state;

		if (
			IMPORT_WALLET_MODAL !== prevState.IMPORT_WALLET_MODAL ||
			CREATE_WALLET_MODAL !== prevState.CREATE_WALLET_MODAL
		) {
			const wal = JSON.parse(localStorage.getItem("wallet"));
			this.setState({ wallet: wal, walletAccounts: wal.accounts });
		}
	};

	showModal = (type, index, address) => () => {
		this.setState({ [type]: true, indexAccount: index, deleteAddress: address });
	};

	hideModal = type => () => {
		this.setState({ [type]: false });
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

	handleExportWallet = () => {
		const wallet = localStorage.getItem("wallet");
		const blob = new Blob([wallet], { type: "text/plain;charset=utf-8" });
		const name = "onyx_pay_wallet.dat";
		saveAs(blob, name);
	};

	handleDeleteAccount = address => {
		let { wallet, walletAccounts, indexAccount } = this.state;
		walletAccounts.splice(indexAccount, 1);
		wallet.accounts = walletAccounts;
		this.setState({ walletAccounts });
		return localStorage.setItem("wallet", JSON.stringify(wallet));
	};

	handleDeleteAddressChange = e => {
		this.setState({ deleteAddress: e.target.value });
	};

	handleChangeAccountLabel = address => {
		this.setState({ showBtn: true, editAccountAddress: address });
	};

	handleChange = (e, address, index) => {
		let { walletAccounts } = this.state;
		let labelValue = e.target.value;
		walletAccounts[index].label = labelValue;
		this.setState({ showBtn: true, editAccountAddress: address, walletAccounts });
	};

	handleFocus = label => {
		this.setState({ currentLabel: label });
	};

	handleSaveAccountLabel = () => {
		let { wallet } = this.state;
		wallet.accounts = this.state.walletAccounts;
		this.setState({ showBtn: false });
		return localStorage.setItem("wallet", JSON.stringify(wallet));
	};

	handleCloseChangeAccountLabel = (current, index) => {
		let { walletAccounts, currentLabel } = this.state;
		walletAccounts[index].label = currentLabel;
		this.setState({ showBtn: false, walletAccounts });
	};

	columns = [
		{
			title: "Wallet address",
			dataIndex: "address",
			key: "address",
			width: "40%",
			render: (text, record, index) => {
				if (text === this.props.defaultAddress) {
					return (
						<>
							{text} <span style={{ color: "#1890ff" }}>(current)</span>
						</>
					);
				} else {
					return text;
				}
			},
		},
		{
			title: "label",
			key: "label",
			width: "40%",
			render: (text, record, index) => {
				return (
					<InputContainer>
						<Input
							defaultValue={record.label}
							value={record.label}
							onChange={e => this.handleChange(e, record.address, index)}
							ref={this.textInput}
							onFocus={() => this.handleFocus(record.label)}
							style={{ minWidth: 200 }}
						/>
						{this.state.showBtn && record.address === this.state.editAccountAddress ? (
							<div className="save-btn">
								<Icon
									type="check"
									className="change-icon"
									onClick={() => this.handleSaveAccountLabel()}
								/>
								<Icon
									type="close"
									className="reject-icon"
									onClick={() => this.handleCloseChangeAccountLabel(record.label, index)}
								/>
							</div>
						) : (
							<div className="save-btn">
								<Icon
									type="edit"
									style={{ color: "rgba(0,0,0,.45)" }}
									onClick={() => this.handleChangeAccountLabel(record.address)}
								/>
							</div>
						)}
					</InputContainer>
				);
			},
		},
		{
			title: "Actions",
			width: "20%",
			render: (text, record, index) => (
				<>
					<Button
						type="danger"
						disabled={this.props.defaultAddress === record.address}
						onClick={this.showModal(modals.DELETE_WALLET_ACCOUNT, index, record.address)}
					>
						Delete <Icon type="delete" />
					</Button>
				</>
			),
		},
	];

	handleTableChange = (pagination, filters, sorter) => {
		this.setState({
			pagination: {
				...this.state.pagination,
				current: pagination.current,
				pageSize: pagination.pageSize,
			},
		});
	};

	render() {
		const { walletAccounts, pagination } = this.state;
		if (walletAccounts === null) {
			return null;
		}
		return (
			<>
				<PageTitle
					tooltip={{
						title:
							"This page allows you to manage your accounts and wallet’s addresses. You can add a new address or delete one, import an existing address, and then export your wallet with changes. Also you can assign a label to each account. Please pay attention that you are not allowed to delete the current  account from you wallet.",
					}}
				>
					Wallet setting
				</PageTitle>
				<ButtonContainer>
					<Button type="primary" onClick={this.showModal(modals.CREATE_WALLET_MODAL)}>
						Create address
					</Button>
					<Button type="primary" onClick={this.showModal(modals.IMPORT_WALLET_MODAL)}>
						Import address
					</Button>
					<Button type="primary" onClick={() => this.handleExportWallet()}>
						Export wallet
					</Button>
				</ButtonContainer>

				<Table
					columns={this.columns}
					dataSource={walletAccounts}
					pagination={{ ...pagination }}
					className="ovf-auto"
					onChange={this.handleTableChange}
				/>

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

				<DeleteWalletAccount
					isModalVisible={this.state.DELETE_WALLET_ACCOUNT}
					hideModal={this.hideModal(modals.DELETE_WALLET_ACCOUNT)}
					address={this.state.deleteAddress}
					handleDeleteAccount={this.handleDeleteAccount}
				/>
			</>
		);
	}
}

export default connect(state => {
	return { wallet: state.wallet, defaultAddress: state.auth.OnyxAddr };
})(WalletSetting);
