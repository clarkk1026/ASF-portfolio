import { githubContactLocked } from './contact-lock';
import { personal } from '../data/portfolio';

const GITHUB_QUESTION =
	/\b(github|git\s*hub|buildflux26|your\s*repo|repo\s*link|code\s*on\s*github|see\s*(his|your|ben'?s?)?\s*code|source\s*code|open\s*source|github\s*profile|git\s*profile|clone\s*repo|fork\s*repo)\b/i;

export const isGithubQuestion = (message: string) =>
	githubContactLocked && GITHUB_QUESTION.test(message);

export const getGithubLockedBotReply = () =>
	`GitHub is not available here right now. Please email Ben at **${personal.email}** and he will get back to you.

[[mood:sorry]]`;
