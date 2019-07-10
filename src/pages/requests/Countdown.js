import React from "react";
import Timer from "react-countdown-now";

export default function Countdown({ date }) {
	const renderer = ({ hours, minutes, seconds, completed }) => {
		if (completed) {
			return <span style={{ color: "#f5222d" }}>time is up</span>;
		} else {
			return (
				<span style={{ fontSize: 14, fontWeight: 500 }}>
					{hours}:{minutes}:{seconds}
				</span>
			);
		}
	};

	return <Timer date={date} renderer={renderer} />;
}
