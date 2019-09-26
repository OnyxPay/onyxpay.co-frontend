import React, { useState, useEffect } from "react";
import { Input, Icon, List, Button, Popconfirm } from "antd";
import { connect } from "react-redux";
import styled from "styled-components";

const ListContainer = styled.div`
	width: 50%;
	position: relative;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	h4,
	input {
		width: 87%;
	}
	h4 {
		margin: 0;
	}
	input {
		padding-right: 50px;
	}
	.save-btn {
		position: absolute;
		right: 110px;
		top: 5px;
	}
`;

const ButtonContainer = styled.div``;

const WalletAddress = props => {
	const [wallet, setWallet] = useState({});
	const [addressEdit, changeAddressEdit] = useState(true);
	const [showBtn, showBtnSaveCloseAccountLabel] = useState(false);

	useEffect(() => {
		const wal = JSON.parse(localStorage.getItem("wallet"));
		setWallet({ ...wal });
	}, []);

	const handleDeleteAccount = deleteAccountAddress => {
		wallet.accounts.map((account, index) => {
			if (account.address === deleteAccountAddress) {
				const newWallet = wallet;
				newWallet.accounts.splice(index, 1);
				setWallet({ ...newWallet });
			}
			return localStorage.setItem("wallet", JSON.stringify(wallet));
		});
	};

	const handleChangeAccountLabel = changeAccountLabel => {
		changeAddressEdit(false);
	};

	const handleChange = (e, changeAccount) => {
		console.log(wallet);
		console.log(e.target.value, changeAccount);
		showBtnSaveCloseAccountLabel(true);
	};

	const handleSaveAccountLabel = () => {
		console.log(1);
	};

	const handleCloseChangeAccountLabel = () => {
		changeAddressEdit(true);
		showBtnSaveCloseAccountLabel(false);
	};

	return (
		<>
			<h3>
				<b>Your wallet account addresses</b>
			</h3>
			<List
				dataSource={wallet.accounts}
				split={false}
				renderItem={account => (
					<List.Item>
						<ListContainer>
							{addressEdit ? (
								<h4>{account.address}</h4>
							) : (
								<>
									<Input
										defaultValue={account.address}
										disabled={props.defaultAddress === account.address || addressEdit}
										onChange={e => handleChange(e, account)}
									/>
									{showBtn && (
										<div className="save-btn">
											<Icon
												type="check"
												className="change-icon"
												onClick={() => handleSaveAccountLabel()}
											/>
											<Icon
												type="close"
												className="reject-icon"
												onClick={() => handleCloseChangeAccountLabel()}
											/>
										</div>
									)}
								</>
							)}
							<ButtonContainer>
								<Button
									type="primary"
									style={{ marginLeft: 5 }}
									disabled={props.defaultAddress === account.address}
									onClick={() => handleChangeAccountLabel(account.label)}
								>
									<Icon type="edit" />
								</Button>
								<Popconfirm
									title={`Delete ...${account.address.slice(-6)}？`}
									okText="Yes"
									cancelText="No"
									onConfirm={() => handleDeleteAccount(account.address)}
								>
									<Button type="danger" disabled={props.defaultAddress === account.address}>
										<Icon type="delete" />
									</Button>
								</Popconfirm>
							</ButtonContainer>
						</ListContainer>
					</List.Item>
				)}
			/>
		</>
	);
};

export default connect(state => {
	return { wallet: state.wallet, defaultAddress: state.auth.OnyxAddr };
})(WalletAddress);
