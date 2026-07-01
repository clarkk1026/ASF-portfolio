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

const POLL_INTERVAL_MS = 5000;
const SESSION_COUNTS_KEY = 'portfolio-visitor-counts-session';

type LiveCounts = { support: number; disagree: number; notCare: number };

const readSessionCounts = (): LiveCounts | null => {
	try {
		const raw = sessionStorage.getItem(SESSION_COUNTS_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<LiveCounts>;
		return {
			support: Math.max(0, Number(parsed.support) || 0),
			disagree: Math.max(0, Number(parsed.disagree) || 0),
			notCare: Math.max(0, Number(parsed.notCare) || 0),
		};
	} catch {
		return null;
	}
};

const writeSessionCounts = (counts: LiveCounts) => {
	sessionStorage.setItem(SESSION_COUNTS_KEY, JSON.stringify(counts));
};

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

export const VisitorNote = () => {
	const bootCounts = readSessionCounts();
	const { pushToast } = useToast();
	const [selection, setSelection] = useState<VisitorNoteSentiment | null>(null);
	const [appliedVote, setAppliedVote] = useState<VisitorNoteSentiment | null>(null);
	const [hasApplied, setHasApplied] = useState(false);
	const [editing, setEditing] = useState(false);
	const [yourReplyId, setYourReplyId] = useState<string | null>(null);
	const [canChangeVote, setCanChangeVote] = useState(true);
	const [canChangeNote, setCanChangeNote] = useState(true);
	const [name, setName] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loadError, setLoadError] = useState('');
	const [loading, setLoading] = useState(true);
	const [ready, setReady] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [supportCount, setSupportCount] = useState(bootCounts?.support ?? 0);
	const [disagreeCount, setDisagreeCount] = useState(bootCounts?.disagree ?? 0);
	const [notCareCount, setNotCareCount] = useState(bootCounts?.notCare ?? 0);
	const [replies, setReplies] = useState<VisitorReply[]>([]);
	const snapshotRef = useRef<VisitorNotesSnapshot | null>(null);
	const skipRemoteNotifyUntilRef = useRef(0);
	const appliedVoteRef = useRef<VisitorNoteSentiment | null>(null);
	const editingRef = useRef(false);

	const liveCounts = {
		support: supportCount,
		disagree: disagreeCount,
		notCare: notCareCount,
	};

	const syncFromServer = (
		data: Awaited<ReturnType<typeof fetchVisitorNotes>>,
	) => {
		const counts: LiveCounts = {
			support: data.supportCount,
			disagree: data.disagreeCount,
			notCare: data.notCareCount,
		};

		setSupportCount(counts.support);
		setDisagreeCount(counts.disagree);
		setNotCareCount(counts.notCare);
		writeSessionCounts(counts);
		setReplies(data.replies);
		setHasApplied(data.hasApplied ?? Boolean(data.yourVote));
		setYourReplyId(data.yourReplyId ?? null);
		setCanChangeVote(data.canChangeVote ?? true);
		setCanChangeNote(data.canChangeNote ?? true);

		const serverVote = data.yourVote ?? null;
		appliedVoteRef.current = serverVote;
		setAppliedVote(serverVote);
		setSelection(serverVote);

		snapshotRef.current = snapshotFromData(data);
		setLoadError('');
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
			setReady(true);
		}
	}, []);

	useEffect(() => {
		editingRef.current = editing;
	}, [editing]);

	useEffect(() => {
		localStorage.removeItem('portfolio-visitor-note-submitted');
		localStorage.removeItem('portfolio-visitor-vote');
		localStorage.removeItem('portfolio-visitor-counts-cache');
		localStorage.removeItem('portfolio-visitor-user-key');
		void loadNotes();
	}, [loadNotes]);

	useEffect(() => {
		if (!ready) return;

		const poll = async () => {
			if (document.hidden || submitting || editingRef.current) return;

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
	}, [ready, pushToast, submitting]);

	const onPickSentiment = (choice: VisitorNoteSentiment) => {
		if (submitting) return;
		setSelection(choice);
		setError('');
	};

	const startEditing = () => {
		const reply = yourReplyId
			? replies.find((item) => item.id === yourReplyId)
			: null;

		setName(reply?.name && reply.name !== 'Anonymous' ? reply.name : '');
		setMessage(reply?.message ?? '');
		setSelection(appliedVote);
		setEditing(true);
		setError('');
	};

	const onApply = async (e: FormEvent) => {
		e.preventDefault();
		setError('');

		const choice = selection;
		const trimmedName = name.trim();
		const trimmedMessage = message.trim();
		const isEdit = hasApplied && editing;

		if (trimmedMessage && !trimmedName) {
			setError('Enter your name when leaving a note.');
			return;
		}

		if (!choice && !trimmedMessage) {
			setError('Pick a status or write a note before applying.');
			return;
		}

		const resolvedChoice = choice ?? appliedVote ?? 'not-care';
		const previousVote = appliedVoteRef.current;
		const voteChanged = Boolean(choice && choice !== previousVote);

		if (isEdit) {
			if (!trimmedMessage && !voteChanged) {
				setEditing(false);
				return;
			}
			if (trimmedMessage && !canChangeNote) {
				setError('You used your note edit. You can still change your status separately.');
				return;
			}
			if (!trimmedMessage && voteChanged && !canChangeVote) {
				setError('You used your status changes (2 resets). Your note can still be edited separately.');
				return;
			}
		} else if (hasApplied) {
			setError('You already applied. Use Edit my response to update it.');
			return;
		}

		setSubmitting(true);
		suppressRemoteNotifications();

		try {
			let data: Awaited<ReturnType<typeof fetchVisitorNotes>>;

			if (trimmedMessage) {
				data = await submitVisitorNote({
					sentiment: resolvedChoice,
					name: trimmedName,
					message: trimmedMessage,
				});
			} else if (!previousVote) {
				data = await submitVisitorVote(resolvedChoice);
			} else if (previousVote !== resolvedChoice) {
				data = await changeVisitorVote(resolvedChoice);
			} else {
				data = await fetchVisitorNotes();
			}

			syncFromServer(data);
			setEditing(false);
			setMessage('');
			pushToast(
				isEdit ? visitorNote.notifyUpdated : visitorNote.notifyApplied,
				'success',
			);
		} catch (err) {
			try {
				syncFromServer(await fetchVisitorNotes());
			} catch {
				// Keep last known totals if refresh fails.
			}
			setError(
				err instanceof Error ? err.message : 'Could not apply your response.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	const activeChoice = selection ?? appliedVote;
	const trimmedMessage = message.trim();
	const trimmedName = name.trim();
	const voteChanged =
		Boolean(selection) && selection !== appliedVote;
	const canApplyInitial =
		!hasApplied &&
		Boolean(selection || trimmedMessage) &&
		(!trimmedMessage || Boolean(trimmedName));
	const canApplyEdit =
		hasApplied &&
		editing &&
		((trimmedMessage && Boolean(trimmedName) && canChangeNote) ||
			(!trimmedMessage && voteChanged && canChangeVote));
	const canApply = canApplyInitial || canApplyEdit;
	const showThanks = ready && hasApplied && !editing;
	const showForm = ready && (!hasApplied || editing);
	const displayCount = (key: keyof LiveCounts) => {
		if (loading && !bootCounts) return '—';
		return liveCounts[key];
	};

	const renderActionArea = () => {
		if (!ready) {
			return (
				<div
					className='visitor-note-action-placeholder glass-card'
					aria-hidden='true'
				>
					<p>{visitorNote.loadingReplies}</p>
				</div>
			);
		}

		if (showThanks) {
			return (
				<div className='visitor-note-thanks-wrap'>
					<p className='visitor-note-thanks glass-card'>
						{visitorNote.thanksMessage}
					</p>
					<button
						type='button'
						className='visitor-note-edit-response'
						onClick={startEditing}
					>
						{visitorNote.editResponseLabel}
					</button>
				</div>
			);
		}

		if (showForm) {
			return (
				<div className='visitor-note-card glass-card visitor-note-interactive'>
					<h2>{editing ? visitorNote.editResponseLabel : visitorNote.headline}</h2>
					<p>{visitorNote.subtext}</p>

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
									disabled={submitting}
									aria-label={label}
									title={label}
								>
									<Icon className='visitor-note-choice-icon' />
								</button>
							))}
						</div>

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
								disabled={submitting}
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
								disabled={submitting}
							/>
						</label>

						<div className='visitor-note-form-actions'>
							<button
								type='submit'
								className='comet-btn comet-btn-talk comet-btn-lg visitor-note-submit'
								disabled={submitting || !canApply}
							>
								{submitting
									? editing
										? visitorNote.savingLabel
										: visitorNote.submittingLabel
									: editing
										? visitorNote.saveLabel
										: visitorNote.submitLabel}
							</button>
							{editing ? (
								<button
									type='button'
									className='visitor-note-cancel-edit'
									onClick={() => {
										setEditing(false);
										setError('');
									}}
									disabled={submitting}
								>
									Cancel
								</button>
							) : null}
						</div>

						<p className='visitor-note-privacy'>{visitorNote.formNote}</p>
					</form>
				</div>
			);
		}

		return null;
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
										{displayCount(countKey)}
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

				<div className='visitor-note-action-area'>{renderActionArea()}</div>
			</div>
		</section>
	);
};
