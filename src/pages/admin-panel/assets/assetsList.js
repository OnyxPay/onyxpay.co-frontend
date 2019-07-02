import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Button, Table, Icon, message, notification } from "antd";
import Actions from "../../../redux/actions";
import { blockAsset, isBlockedAsset } from "../../../api/admin/assets";
import AddNewAsset from "../../../components/modals/admin/AddNewAsset";
import { TimeoutError } from "promise-timeout";

const modals = {
	ADD_ASSETS_MODAL: "ADD_ASSETS_MODAL",
};

const style = {
	button: {
		marginRight: 8,
	},
};

class AssetsList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loadingBlockedAsset: false,
			loadingIsBlockedAsset: false,
			ADD_ASSETS_MODAL: false,
			data: null,
			pagination: { current: 1, pageSize: 20 },
			symbolKey: null,
		};
	}

	static getDerivedStateFromProps(props) {
		return { data: props.assets.map((item, i) => ({ key: i, symbol: item })) };
	}

	componentDidMount() {
		const { getAssetsList } = this.props;
		getAssetsList();
	}

	showModal = type => () => {
		this.setState({ ADD_ASSETS_MODAL: true });
	};

	hideModal = type => () => {
		this.setState({ ADD_ASSETS_MODAL: false });
	};

	handleBlockAsset = async (asset_symbol, key) => {
		this.setState({
			symbolKey: key,
			loadingBlockedAsset: true,
		});
		try {
			await blockAsset(asset_symbol);
		} catch (e) {
			if (e instanceof TimeoutError) {
				notification.info({
					message: e.message,
					description:
						"Your transaction has not completed in time. This does not mean it necessary failed. Check result later",
				});
			} else {
				message.error(e.message);
			}
		}
		this.setState({
			loadingBlockedAsset: false,
		});
	};

	handleCheckAssetBlocked = async (asset_symbol, key) => {
		this.setState({
			symbolKey: key,
			loadingIsBlockedAsset: true,
		});
		const res = await isBlockedAsset(asset_symbol);
		this.setState({
			loadingIsBlockedAsset: false,
		});
		if (res === "01") {
			message.success("Asset is blocked");
		} else {
			message.success("Asset isn't blocked");
		}
	};

	render() {
		const { loadingIsBlockedAsset, pagination, data, loadingBlockedAsset } = this.state;
		if (!data.length) {
			return false;
		}
		const columns = [
			{
				title: "Asset name",
				key: "asset-name",
				width: "80%",
				dataIndex: "symbol",
			},
			{
				title: "Action",
				key: "action",
				width: "20%",
				dataIndex: "",
				render: res => (
					<>
						<Button
							type="danger"
							loading={res.key === this.state.symbolKey && loadingBlockedAsset}
							onClick={() => this.handleBlockAsset(res.symbol, res.key)}
							style={style.button}
						>
							Block asset
						</Button>
						<Button
							loading={res.key === this.state.symbolKey && loadingIsBlockedAsset}
							onClick={() => this.handleCheckAssetBlocked(res.symbol, res.key)}
							style={style.button}
						>
							Is blocked asset
						</Button>
					</>
				),
			},
		];

		return (
			<>
				<Card>
					<div style={{ marginBottom: 30 }}>
						<Button type="primary" onClick={this.showModal(modals.ADD_ASSETS_MODAL)}>
							<Icon type="plus" /> Add new asset
						</Button>
					</div>

					<Table
						rowKey={data => data.key}
						columns={columns}
						dataSource={data}
						style={{ overflowX: "auto" }}
						pagination={pagination}
					/>
				</Card>

				<AddNewAsset
					isModalVisible={this.state.ADD_ASSETS_MODAL}
					hideModal={this.hideModal(modals.ADD_ASSETS_MODAL)}
				/>
			</>
		);
	}
}

export default connect(
	state => {
		return {
			assets: state.assets.list,
		};
	},
	{
		getAssetsList: Actions.assets.getAssetsList,
		blockAsset,
		isBlockedAsset,
	}
)(AssetsList);
