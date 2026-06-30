import { useEffect, useState } from 'react';
import { brandLetterClass, type BrandLetter } from '../data/brand-letters';

type RoleRotatorProps = {
	roles: string[];
	intervalMs?: number;
};

const roleLeadLetter = (role: string): BrandLetter | null => {
	const letter = role.trim()[0]?.toUpperCase();
	if (letter === 'A' || letter === 'S' || letter === 'F') return letter;
	return null;
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

	const role = roles[index] ?? '';
	const leadLetter = roleLeadLetter(role);
	const rest = leadLetter ? role.slice(1) : role;

	return (
		<span className={`role-rotator ${visible ? 'role-rotator-visible' : ''}`}>
			{leadLetter ? (
				<>
					<span className={`role-rotator-letter ${brandLetterClass(leadLetter)}`}>
						{leadLetter}
					</span>
					<span className='role-rotator-rest'>{rest}</span>
				</>
			) : (
				role
			)}
		</span>
	);
};
