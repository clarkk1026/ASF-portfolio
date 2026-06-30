import { personal } from '../data/portfolio.js';

export const githubContactLocked = true;

export const githubLockedMessage = `GitHub contact is locked by the administrator. Please reach out to Ben at ${personal.email}.`;

export const preventLockedGithubContact = (
	event: { preventDefault: () => void },
	onNotify: (message: string) => void,
) => {
	if (!githubContactLocked) return false;

	event.preventDefault();
	onNotify(githubLockedMessage);
	return true;
};
