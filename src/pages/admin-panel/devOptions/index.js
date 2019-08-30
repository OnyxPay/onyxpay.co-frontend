import React from "react";
import { Radio, Typography, Card, Spin, Icon } from "antd";
import { getMode, changeMode } from "api/dev-options";
import { handleBcError } from "api/network";
const { Text } = Typography;

const loadingIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const DevOptions = () => {
	const [modeCode, setModeNumber] = React.useState(0);
	const [isLoading, setLoading] = React.useState(false);

	async function fetchModeValue() {
		try {
			let response = await getMode();
			setModeNumber(response);
		} catch (e) {
			handleBcError(e);
		}
	}

	React.useEffect(() => {
		fetchModeValue();
	}, []);

	const onChange = async e => {
		const newModeValue = e.target.value;
		try {
			setModeNumber(newModeValue);
			setLoading(true);
			await changeMode(newModeValue);
		} catch (e) {
			handleBcError(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<Text level={4} style={{ display: "block", marginBottom: 12 }}>
				Choose Request holder mode
			</Text>
			<div>
				<Radio.Group
					onChange={onChange}
					options={[
						{ label: "main", value: 0 },
						{ label: "test", value: 1 },
						{ label: "dev", value: 2 },
					]}
					value={modeCode}
					disabled={isLoading}
				/>
				{isLoading && <Spin indicator={loadingIcon} />}
			</div>
		</Card>
	);
};

export default DevOptions;
