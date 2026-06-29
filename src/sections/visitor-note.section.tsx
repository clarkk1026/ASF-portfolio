import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { useToast } from '../components/toast-provider';
import {
	visitorNote,
	type VisitorNoteSentiment,
} from '../data/portfolio';
import {
	cancelVisitorVote,
	changeVisitorVote,
	fetchVisitorNotes,
	submitVisitorNote,
	submitVisitorVote,
} from '../lib/visitor-notes-api';
import {
	diffVisitorActivity,
	snapshotFromData,
	type VisitorNotesSnapshot,
} from '../lib/visitor-notes-events';
import type { VisitorReply } from '../lib/visitor-notes-types';

const SUBMITTED_KEY = 'portfolio-visitor-note-submitted';
const VOTE_KEY = 'portfolio-visitor-vote';
const POLL_INTERVAL_MS = 15000;

const formatReplyDate = (iso: string) => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const sentimentLabel = (sentiment: VisitorNoteSentiment) => {
	if (sentiment === 'support') return visitorNote.supportLabel;
	if (sentiment === 'disagree') return visitorNote.disagreeLabel;
	return visitorNote.notCareLabel;
};

export const VisitorNote = () => {
	const { pushToast } = useToast();
	const [sentiment, setSentiment] = useState<VisitorNoteSentiment | null>(
		null,
	);
	const [name, setName] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [voting, setVoting] = useState(false);
	const [supportCount, setSupportCount] = useState(0);
	const [disagreeCount, setDisagreeCount] = useState(0);
	const [notCareCount, setNotCareCount] = useState(0);
	const [replies, setReplies] = useState<VisitorReply[]>([]);
	const [hasSubmitted, setHasSubmitted] = useState(
		() => localStorage.getItem(SUBMITTED_KEY) === '1',
	);
	const [userVote, setUserVote] = useState<VisitorNoteSentiment | null>(
		() => {
			const saved = localStorage.getItem(VOTE_KEY);
			if (
				saved === 'support' ||
				saved === 'disagree' ||
				saved === 'not-care'
			) {
				return saved;
			}
			return null;
		},
	);
	const snapshotRef = useRef<VisitorNotesSnapshot | null>(null);
	const skipRemoteNotifyUntilRef = useRef(0);

	const applyData = (data: Awaited<ReturnType<typeof fetchVisitorNotes>>) => {
		setSupportCount(data.supportCount);
		setDisagreeCount(data.disagreeCount);
		setNotCareCount(data.notCareCount);
		setReplies(data.replies);
		snapshotRef.current = snapshotFromData(data);
	};

	const notifyRemoteChanges = (
		data: Awaited<ReturnType<typeof fetchVisitorNotes>>,
	) => {
		if (Date.now() < skipRemoteNotifyUntilRef.current) return;

		const previous = snapshotRef.current;
		if (!previous) return;

		for (const message of diffVisitorActivity(previous, data)) {
			pushToast(message, 'activity');
		}
	};

	const suppressRemoteNotifications = () => {
		skipRemoteNotifyUntilRef.current = Date.now() + 4000;
	};

	const loadNotes = useCallback(async () => {
		setLoading(true);
		try {
			applyData(await fetchVisitorNotes());
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadNotes();
	}, [loadNotes]);

	useEffect(() => {
		const poll = async () => {
			if (document.hidden) return;

			try {
				const data = await fetchVisitorNotes();
				notifyRemoteChanges(data);
				applyData(data);
			} catch {
				// Keep the last known counts if polling fails.
			}
		};

		const intervalId = window.setInterval(() => {
			void poll();
		}, POLL_INTERVAL_MS);

		return () => window.clearInterval(intervalId);
	}, [pushToast]);

	const totalVisitorCount = supportCount + disagreeCount + notCareCount;

	const onVote = async (choice: VisitorNoteSentiment) => {
		if (voting) return;

		setError('');
		setVoting(true);
		try {
			const data = await submitVisitorVote(choice);
			suppressRemoteNotifications();
			applyData(data);
			localStorage.setItem(VOTE_KEY, choice);
			setUserVote(choice);
			setSentiment(choice);
			pushToast(visitorNote.notifyVoteRecorded, 'success');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not register vote.');
		} finally {
			setVoting(false);
		}
	};

	const onChangeVote = async (choice: VisitorNoteSentiment) => {
		if (!userVote || userVote === choice || voting) return;

		setError('');
		setVoting(true);
		try {
			const data = await changeVisitorVote(userVote, choice);
			suppressRemoteNotifications();
			applyData(data);
			localStorage.setItem(VOTE_KEY, choice);
			setUserVote(choice);
			setSentiment(choice);
			pushToast(
				visitorNote.notifyVoteUpdated.replace(
					'{sentiment}',
					sentimentLabel(choice),
				),
				'success',
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not change vote.');
		} finally {
			setVoting(false);
		}
	};

	const onCancelVote = async () => {
		if (!userVote || voting) return;

		setError('');
		setVoting(true);
		try {
			const data = await cancelVisitorVote(userVote);
			suppressRemoteNotifications();
			applyData(data);
			localStorage.removeItem(VOTE_KEY);
			setUserVote(null);
			setSentiment(null);
			pushToast(visitorNote.notifyVoteCancelled, 'success');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not cancel vote.');
		} finally {
			setVoting(false);
		}
	};

	const onSentimentPick = async (choice: VisitorNoteSentiment) => {
		if (voting) return;

		if (!userVote) {
			await onVote(choice);
			return;
		}

		if (userVote === choice) {
			setSentiment(choice);
			return;
		}

		await onChangeVote(choice);
	};

	useEffect(() => {
		if (userVote) {
			setSentiment(userVote);
		}
	}, [userVote]);

	const activeSentiment = userVote ?? sentiment;
	const canPost = Boolean(activeSentiment || message.trim());

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError('');

		const trimmedMessage = message.trim();
		const hasChoice = Boolean(activeSentiment);

		if (!hasChoice && !trimmedMessage) {
			setError('Choose a button or write a note before posting.');
			return;
		}

		if (trimmedMessage && !hasChoice) {
			setError('Choose interested, not convinced, or neutral for your note.');
			return;
		}

		if (!trimmedMessage && hasChoice) {
			suppressRemoteNotifications();
			localStorage.setItem(SUBMITTED_KEY, '1');
			setHasSubmitted(true);
			pushToast(visitorNote.notifyVoteRecorded, 'success');
			return;
		}

		setSubmitting(true);
		try {
			const data = await submitVisitorNote({
				sentiment: activeSentiment!,
				name,
				message: trimmedMessage,
			});
			suppressRemoteNotifications();
			applyData(data);
			localStorage.setItem(SUBMITTED_KEY, '1');
			setHasSubmitted(true);
			pushToast(visitorNote.notifyNotePosted, 'success');
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Could not post your note.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section
			className='visitor-note container'
			id='visitor-voices'
		>
			<div className='section-sidebar visitor-note-title'>
				<LayeredSectionTitle
					primary={visitorNote.section.title}
					secondary={visitorNote.section.subtitle}
					summary={visitorNote.section.summary}
				/>
			</div>

			<div className='visitor-note-content'>
				<Reveal delay={80}>
					<div className='visitor-note-stats'>
						<div className='visitor-note-stat visitor-note-stat-total glass-card'>
							<span className='visitor-note-stat-value'>
								{loading ? '—' : totalVisitorCount}
							</span>
							<span className='visitor-note-stat-label'>
								{visitorNote.totalVisitorsStatLabel}
							</span>
						</div>
						<div className='visitor-note-stat visitor-note-stat-support glass-card'>
							<span className='visitor-note-stat-value'>
								{loading ? '—' : supportCount}
							</span>
							<span className='visitor-note-stat-label'>
								{visitorNote.supportStatLabel}
							</span>
						</div>
						<div className='visitor-note-stat visitor-note-stat-disagree glass-card'>
							<span className='visitor-note-stat-value'>
								{loading ? '—' : disagreeCount}
							</span>
							<span className='visitor-note-stat-label'>
								{visitorNote.disagreeStatLabel}
							</span>
						</div>
						<div className='visitor-note-stat visitor-note-stat-notcare glass-card'>
							<span className='visitor-note-stat-value'>
								{loading ? '—' : notCareCount}
							</span>
							<span className='visitor-note-stat-label'>
								{visitorNote.notCareStatLabel}
							</span>
						</div>
					</div>
				</Reveal>

				<Reveal delay={120}>
					<div className='visitor-note-replies glass-card'>
						<div className='visitor-note-replies-header'>
							<h3>{visitorNote.repliesTitle}</h3>
							<p>{visitorNote.repliesSummary}</p>
						</div>

						{loading ? (
							<p className='visitor-note-replies-empty'>
								{visitorNote.loadingReplies}
							</p>
						) : replies.length === 0 ? (
							<p className='visitor-note-replies-empty'>
								{visitorNote.emptyReplies}
							</p>
						) : (
							<ul className='visitor-note-reply-list'>
								{replies.map((reply) => (
									<li
										key={reply.id}
										className={`visitor-note-reply visitor-note-reply-${reply.sentiment}`}
									>
										<div className='visitor-note-reply-meta'>
											<span
												className={`visitor-note-reply-badge visitor-note-reply-badge-${reply.sentiment}`}
											>
												{sentimentLabel(reply.sentiment)}
											</span>
											<span className='visitor-note-reply-name'>
												{reply.name}
											</span>
											<time
												className='visitor-note-reply-date'
												dateTime={reply.createdAt}
											>
												{formatReplyDate(reply.createdAt)}
											</time>
										</div>
										<p className='visitor-note-reply-message'>
											{reply.message}
										</p>
									</li>
								))}
							</ul>
						)}
					</div>
				</Reveal>

				{!hasSubmitted ? (
					<Reveal delay={160}>
						<div className='visitor-note-card glass-card visitor-note-interactive'>
							<h2>{visitorNote.headline}</h2>
							<p>{visitorNote.subtext}</p>

							<form
								className='visitor-note-form'
								onSubmit={onSubmit}
							>
								<div
									className='visitor-note-sentiment'
									role='group'
									aria-label='Cast your vote'
								>
									<button
										type='button'
										className={`visitor-note-choice ${(userVote ?? sentiment) === 'support' ? 'visitor-note-choice-active visitor-note-choice-support' : ''}`}
										onClick={() => void onSentimentPick('support')}
										disabled={voting}
									>
										{visitorNote.supportLabel}
									</button>
									<button
										type='button'
										className={`visitor-note-choice ${(userVote ?? sentiment) === 'disagree' ? 'visitor-note-choice-active visitor-note-choice-disagree' : ''}`}
										onClick={() => void onSentimentPick('disagree')}
										disabled={voting}
									>
										{visitorNote.disagreeLabel}
									</button>
									<button
										type='button'
										className={`visitor-note-choice ${(userVote ?? sentiment) === 'not-care' ? 'visitor-note-choice-active visitor-note-choice-notcare' : ''}`}
										onClick={() => void onSentimentPick('not-care')}
										disabled={voting}
									>
										{visitorNote.notCareLabel}
									</button>
								</div>

								{userVote ? (
									<div className='visitor-note-vote-actions'>
										<p className='visitor-note-vote-done'>
											You voted: {sentimentLabel(userVote)}
										</p>
										<button
											type='button'
											className='visitor-note-cancel-vote'
											onClick={() => void onCancelVote()}
											disabled={voting}
										>
											{visitorNote.cancelVoteLabel}
										</button>
									</div>
								) : null}

								{error && !submitting && !voting ? (
									<p
										className='visitor-note-error'
										role='alert'
									>
										{error}
									</p>
								) : null}

								<label className='visitor-note-field'>
									<span className='visually-hidden'>Your name</span>
									<input
										type='text'
										name='name'
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder={visitorNote.namePlaceholder}
										autoComplete='name'
										maxLength={48}
									/>
								</label>

								<label className='visitor-note-field'>
									<span className='visually-hidden'>Your note</span>
									<textarea
										name='message'
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder={visitorNote.messagePlaceholder}
										rows={5}
										maxLength={600}
									/>
								</label>

								<button
									type='submit'
									className='comet-btn comet-btn-talk comet-btn-lg visitor-note-submit'
									disabled={submitting || voting || !canPost}
								>
									{submitting
										? visitorNote.submittingLabel
										: visitorNote.submitLabel}
								</button>

								<p className='visitor-note-privacy'>
									{visitorNote.formNote}
								</p>
							</form>
						</div>
					</Reveal>
				) : (
					<Reveal delay={160}>
						<p className='visitor-note-thanks glass-card'>
							{visitorNote.thanksMessage}
						</p>
					</Reveal>
				)}
			</div>
		</section>
	);
};
