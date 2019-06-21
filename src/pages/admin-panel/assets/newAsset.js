import React, { Component } from "react";
import { Input, Button } from "antd";

class NewAssets extends Component {
	state = {};
	callback(key) {
		console.log(key);
	}
	render() {
		return (
			<>
				<Input placeholder="Basic usage" />
				<Input placeholder="Basic usage" />
				<Button>Add</Button>
			</>
		);
	}
}

export default NewAssets;
