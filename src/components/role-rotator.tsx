import { useEffect, useState } from 'react';

type RoleRotatorProps = {
	roles: string[];
	intervalMs?: number;
};

export const RoleRotator = ({ roles, intervalMs = 2800 }: RoleRotatorProps) => {
	const [index, setIndex] = useState(0);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		if (roles.length <= 1) return;

		const timer = window.setInterval(() => {
			setVisible(false);
			window.setTimeout(() => {
				setIndex((prev) => (prev + 1) % roles.length);
				setVisible(true);
			}, 400);
		}, intervalMs);

		return () => window.clearInterval(timer);
	}, [roles.length, intervalMs]);

	return (
		<span className={`role-rotator ${visible ? 'role-rotator-visible' : ''}`}>
			{roles[index]}
		</span>
	);
};
