import React from "react";
import { Route } from "react-router-dom";

export const ExternalRedirect = props => {
	const { link, ...routeProps } = props;

	return (
		<Route
			{...routeProps}
			render={() => {
				window.location.replace(link);
				return null;
			}}
		/>
	);
};
