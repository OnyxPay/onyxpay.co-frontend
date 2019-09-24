import React from "react";
import { Input, Icon, List, Button } from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { showNotification } from "components/notification";
import { connect } from "react-redux";

const WalletAddress = props => {
	let walletAddress = localStorage.getItem("OnyxAddr");
	const { wallet } = props;
	return (
		<>
			<h3>
				<b>Your wallet addresses</b>
			</h3>
			<div>
				<List
					dataSource={wallet.accounts}
					split={false}
					renderItem={account => (
						<>
							<List.Item>
								<span>{account.address}</span>
								<Button type="primary">
									<Icon type="edit" />
								</Button>
								<Button type="danger">
									<Icon type="delete" />
								</Button>
							</List.Item>
						</>
					)}
				/>
			</div>
		</>
	);
};

export default connect(state => {
	return { wallet: state.wallet };
})(WalletAddress);
