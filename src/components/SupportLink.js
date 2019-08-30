import React from "react";
import { supportEmail } from "api/constants";

const SupportLink = ({ linkText = "contact the support" }) => {
	return <a href={`mailto:${supportEmail}`}>{linkText}</a>;
};

export default SupportLink;
