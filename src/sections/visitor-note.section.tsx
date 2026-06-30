import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { FaMinus, FaThumbsDown, FaThumbsUp } from 'react-icons/fa6';
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
import { voteKeyForSentiment } from '../lib/visitor-notes-types';

const POLL_INTERVAL_MS = 5000;

type LiveCounts = { support: number; disagree: number; notCare: number };

const sentimentOptions = [
	{
		id: 'support' as const,
		label: visitorNote.supportLabel,
		Icon: FaThumbsUp,
		countKey: 'support' as const,
	},
	{
		id: 'disagree' as const,
		label: visitorNote.disagreeLabel,
		Icon: FaThumbsDown,
		countKey: 'disagree' as const,
	},
	{
		id: 'not-care' as const,
		label: visitorNote.notCareLabel,
		Icon: FaMinus,
		countKey: 'notCare' as const,
	},
];

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

const applyCounts = (
	counts: LiveCounts,
	from: VisitorNoteSentiment | null,
	to: VisitorNoteSentiment | null,
): LiveCounts => {
	const next = { ...counts };
	if (from) {
		const fromKey = voteKeyForSentiment(from);
		next[fromKey] = Math.max(0, next[fromKey] - 1);
	}
	if (to) {
		const toKey = voteKeyForSentiment(to);
		next[toKey] += 1;
	}
	return next;
};

export const VisitorNote = () => {
	const { pushToast } = useToast();
	const [selection, setSelection] = useState<VisitorNoteSentiment | null>(null);
	const [appliedVote, setAppliedVote] = useState<VisitorNoteSentiment | null>(null);
	const [name, setName] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loadError, setLoadError] = useState('');
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [voting, setVoting] = useState(false);
	const [supportCount, setSupportCount] = useState(0);
	const [disagreeCount, setDisagreeCount] = useState(0);
	const [notCareCount, setNotCareCount] = useState(0);
	const [replies, setReplies] = useState<VisitorReply[]>([]);
	const [voteLocked, setVoteLocked] = useState(false);
	const [actionsRemaining, setActionsRemaining] = useState(2);
	const snapshotRef = useRef<VisitorNotesSnapshot | null>(null);
	const skipRemoteNotifyUntilRef = useRef(0);
	const appliedVoteRef = useRef<VisitorNoteSentiment | null>(null);

	const liveCounts = {
		support: supportCount,
		disagree: disagreeCount,
		notCare: notCareCount,
	};

	const syncFromServer = (
		data: Awaited<ReturnType<typeof fetchVisitorNotes>>,
	) => {
		setSupportCount(data.supportCount);
		setDisagreeCount(data.disagreeCount);
		setNotCareCount(data.notCareCount);
		setReplies(data.replies);
		setVoteLocked(data.voteLocked ?? false);
		setActionsRemaining(data.actionsRemaining ?? 0);

		const serverVote = data.yourVote ?? null;
		appliedVoteRef.current = serverVote;
		setAppliedVote(serverVote);
		if (serverVote) {
			setSelection(serverVote);
		}

		snapshotRef.current = snapshotFromData(data);
		setLoadError('');
	};

	const setCounts = (counts: LiveCounts) => {
		setSupportCount(counts.support);
		setDisagreeCount(counts.disagree);
		setNotCareCount(counts.notCare);
	};

	const suppressRemoteNotifications = () => {
		skipRemoteNotifyUntilRef.current = Date.now() + 4000;
	};

	const loadNotes = useCallback(async () => {
		try {
			syncFromServer(await fetchVisitorNotes());
		} catch (err) {
			setLoadError(
				err instanceof Error ? err.message : visitorNote.loadError,
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadNotes();
	}, [loadNotes]);

	useEffect(() => {
		const poll = async () => {
			if (document.hidden || submitting || voting) return;

			try {
				const data = await fetchVisitorNotes();
				const previous = snapshotRef.current;

				if (
					previous &&
					Date.now() >= skipRemoteNotifyUntilRef.current
				) {
					for (const note of diffVisitorActivity(previous, data)) {
						pushToast(note, 'activity');
					}
				}

				syncFromServer(data);
			} catch {
				// Keep last known totals if polling fails briefly.
			}
		};

		const intervalId = window.setInterval(() => {
			void poll();
		}, POLL_INTERVAL_MS);

		return () => window.clearInterval(intervalId);
	}, [pushToast, submitting, voting]);

	const onPickSentiment = (choice: VisitorNoteSentiment) => {
		if (submitting || voting || voteLocked) return;
		setSelection(choice);
		setError('');
	};

	const onCancelVote = async () => {
		if (!appliedVote || voting || submitting || voteLocked) return;

		const previousVote = appliedVote;
		const optimistic = applyCounts(liveCounts, previousVote, null);

		setError('');
		setVoting(true);
		setCounts(optimistic);
		suppressRemoteNotifications();

		try {
			const data = await cancelVisitorVote();
			syncFromServer(data);
			setSelection(null);
			pushToast(visitorNote.notifyVoteCancelled, 'info');
		} catch (err) {
			try {
				syncFromServer(await fetchVisitorNotes());
			} catch {
				// Keep optimistic rollback via next poll.
			}
			setError(err instanceof Error ? err.message : 'Could not remove vote.');
		} finally {
			setVoting(false);
		}
	};

	const onApply = async (e: FormEvent) => {
		e.preventDefault();
		setError('');

		const choice = selection;
		const trimmedMessage = message.trim();

		if (!choice) {
			setError('Choose interested, not convinced, or neutral before applying.');
			return;
		}

		if (voteLocked) {
			setError(visitorNote.voteLimitMessage);
			return;
		}

		const previousVote = appliedVoteRef.current;
		if (previousVote === choice && !trimmedMessage) {
			return;
		}

		const optimistic = applyCounts(liveCounts, previousVote, choice);
		setSubmitting(true);
		setCounts(optimistic);
		suppressRemoteNotifications();

		try {
			let data: Awaited<ReturnType<typeof fetchVisitorNotes>>;

			if (!previousVote) {
				data = await submitVisitorVote(choice);
			} else if (previousVote !== choice) {
				data = await changeVisitorVote(previousVote, choice);
			} else {
				data = await fetchVisitorNotes();
			}

			if (trimmedMessage) {
				data = await submitVisitorNote({
					sentiment: choice,
					name,
					message: trimmedMessage,
				});
			}

			syncFromServer(data);
			setMessage('');
			pushToast(visitorNote.notifyApplied, 'success');
		} catch (err) {
			try {
				syncFromServer(await fetchVisitorNotes());
			} catch {
				setCounts(liveCounts);
			}
			setError(
				err instanceof Error ? err.message : 'Could not apply your response.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const activeChoice = selection ?? appliedVote;
	const canChangeVote = !voteLocked && actionsRemaining > 0;
	const showLockedState = voteLocked && Boolean(appliedVote);
	const showLockedEmpty = voteLocked && !appliedVote;

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
					<div className='visitor-note-stats-wrap'>
						<p className='visitor-note-live-label'>{visitorNote.liveCountsLabel}</p>
						<div className='visitor-note-stats'>
							{sentimentOptions.map(({ id, label, Icon, countKey }) => (
								<div
									key={id}
									className={`visitor-note-stat visitor-note-stat-${id === 'not-care' ? 'notcare' : id}`}
								>
									<span
										className='visitor-note-stat-icon'
										aria-hidden='true'
									>
										<Icon />
									</span>
									<span className='visitor-note-stat-value'>
										{loading ? '—' : liveCounts[countKey]}
									</span>
									<span className='visitor-note-stat-label'>{label}</span>
								</div>
							))}
						</div>
						{loadError ? (
							<p
								className='visitor-note-load-error'
								role='alert'
							>
								{loadError}
							</p>
						) : null}
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

				{showLockedState ? (
					<Reveal delay={160}>
						<div className='visitor-note-thanks-wrap'>
							<p className='visitor-note-thanks glass-card'>
								{visitorNote.thanksMessage}
							</p>
							<p className='visitor-note-limit-notice'>
								{visitorNote.voteLimitMessage}
							</p>
						</div>
					</Reveal>
				) : showLockedEmpty ? (
					<Reveal delay={160}>
						<p className='visitor-note-limit-notice visitor-note-limit-notice-card glass-card'>
							{visitorNote.voteLimitMessage}
						</p>
					</Reveal>
				) : (
					<Reveal delay={160}>
						<div className='visitor-note-card glass-card visitor-note-interactive'>
							<h2>{visitorNote.headline}</h2>
							<p>{visitorNote.subtext}</p>

							{canChangeVote && appliedVote ? (
								<p className='visitor-note-actions-remaining'>
									{visitorNote.actionsRemainingLabel.replace(
										'{count}',
										String(actionsRemaining),
									)}
								</p>
							) : null}

							<form
								className='visitor-note-form'
								onSubmit={onApply}
							>
								<div
									className='visitor-note-sentiment'
									role='group'
									aria-label='Choose your status'
								>
									{sentimentOptions.map(({ id, label, Icon }) => (
										<button
											key={id}
											type='button'
											className={`comet-btn comet-btn-vote visitor-note-choice visitor-note-choice-${id === 'not-care' ? 'notcare' : id} ${activeChoice === id ? 'visitor-note-choice-active' : ''}`}
											onClick={() => onPickSentiment(id)}
											disabled={submitting || voting || voteLocked}
											aria-label={label}
											title={label}
										>
											<Icon className='visitor-note-choice-icon' />
										</button>
									))}
								</div>

								{appliedVote ? (
									<div className='visitor-note-vote-actions'>
										<p className='visitor-note-vote-done'>
											{(() => {
												const applied = sentimentOptions.find(
													(item) => item.id === appliedVote,
												);
												const AppliedIcon = applied?.Icon;
												return (
													<>
														{AppliedIcon ? (
															<span
																className='visitor-note-vote-done-icon'
																aria-hidden='true'
															>
																<AppliedIcon />
															</span>
														) : null}
														<span>Applied: {sentimentLabel(appliedVote)}</span>
													</>
												);
											})()}
										</p>
										{canChangeVote ? (
											<button
												type='button'
												className='visitor-note-cancel-vote'
												onClick={() => void onCancelVote()}
												disabled={voting || submitting}
											>
												{visitorNote.cancelVoteLabel}
											</button>
										) : null}
									</div>
								) : null}

								{error ? (
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
										disabled={submitting || voting || voteLocked}
									/>
								</label>

								<label className='visitor-note-field'>
									<span className='visually-hidden'>Your note</span>
									<textarea
										name='message'
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder={visitorNote.messagePlaceholder}
										rows={4}
										maxLength={600}
										disabled={submitting || voting || voteLocked}
									/>
								</label>

								<button
									type='submit'
									className='comet-btn comet-btn-talk comet-btn-lg visitor-note-submit'
									disabled={
										submitting ||
										voting ||
										voteLocked ||
										!activeChoice ||
										(Boolean(appliedVote) &&
											activeChoice === appliedVote &&
											!message.trim())
									}
								>
									{submitting
										? visitorNote.submittingLabel
										: visitorNote.submitLabel}
								</button>

								<p className='visitor-note-privacy'>{visitorNote.formNote}</p>
							</form>
						</div>
					</Reveal>
				)}
			</div>
		</section>
	);
};
