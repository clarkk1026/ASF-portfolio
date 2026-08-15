import {
	type FormEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	FaCheck,
	FaCopy,
	FaPaperPlane,
	FaPen,
	FaTrash,
	FaXmark,
} from 'react-icons/fa6';
import { BonIcon } from './bon-icon';
import { EarthFabGlobe } from './earth-fab-globe';
import { fetchBotReply } from '../lib/ai-bot-api';
import {
	BOT_MOOD_COLOR,
	BOT_MOOD_LABEL,
	BOT_NAME,
	BOT_SUBTITLE,
	botGreeting,
	hasBotMoodTag,
	parseBotMood,
	resolveMoodFromIntent,
	type BotMood,
} from '../lib/ai-bot-brand';
import {
	getBotResponse,
	botQuickPrompts,
	simulateTypingDelay,
	type BotContext,
	type BotMessage,
} from '../lib/ai-bot-responses';
import { githubLockedMessage } from '../lib/contact-lock';
import { useToast } from './toast-provider';

const createId = () => crypto.randomUUID();

const greetingParsed = parseBotMood(botGreeting);

const createGreeting = (): BotMessage => ({
	id: createId(),
	role: 'bot',
	text: greetingParsed.text,
	mood: greetingParsed.mood,
});

const renderText = (text: string) => {
	const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
	return parts.map((part, i) => {
		if (part.startsWith('**') && part.endsWith('**')) {
			return <strong key={i}>{part.slice(2, -2)}</strong>;
		}
		const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
		if (linkMatch) {
			return (
				<a
					key={i}
					href={linkMatch[2]}
					target='_blank'
					rel='noopener noreferrer'
				>
					{linkMatch[1]}
				</a>
			);
		}
		return part.split('\n').map((line, j, arr) => (
			<span key={`${i}-${j}`}>
				{line}
				{j < arr.length - 1 && <br />}
			</span>
		));
	});
};

const BotMoodTag = ({ mood }: { mood: BotMood }) => (
	<span
		className='ai-bot-mood-tag'
		style={{ ['--mood-color' as string]: BOT_MOOD_COLOR[mood] }}
	>
		<span
			className='ai-bot-mood-dot'
			aria-hidden='true'
		/>
		{BOT_MOOD_LABEL[mood]}
	</span>
);

export const AiBot = () => {
	const { pushToast } = useToast();
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const [typing, setTyping] = useState(false);
	const [messages, setMessages] = useState<BotMessage[]>([createGreeting()]);
	const [botContext, setBotContext] = useState<BotContext>({
		lastIntent: null,
		turn: 0,
	});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState('');
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const bodyRef = useRef<HTMLDivElement>(null);
	const editInputRef = useRef<HTMLTextAreaElement>(null);

	const activeMood = useMemo(() => {
		for (let index = messages.length - 1; index >= 0; index -= 1) {
			const message = messages[index];
			if (message.role === 'bot' && message.mood) return message.mood;
		}
		return greetingParsed.mood;
	}, [messages]);

	const scrollToBottom = () => {
		const el = bodyRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, typing]);

	useEffect(() => {
		if (editingId && editInputRef.current) {
			editInputRef.current.focus();
			editInputRef.current.select();
		}
	}, [editingId]);

	const requestReply = async (
		userText: string,
		historyMessages: BotMessage[],
		context: BotContext,
	) => {
		let replyText = '';
		let intent = 'fallback';
		let userName = context.userName;
		let mood: BotMood = 'calm';
		let showGithubAlert = false;
		let replySource: 'gemini' | 'groq' | 'local' = 'local';

		try {
			const reply = await fetchBotReply(userText, historyMessages, context);
			replySource = reply.source;
			const parsed = parseBotMood(reply.text);
			replyText = parsed.text;
			mood =
				reply.mood ??
				(hasBotMoodTag(reply.text)
					? parsed.mood
					: resolveMoodFromIntent(reply.intent));
			intent = reply.intent;
			showGithubAlert = Boolean(reply.showGithubAlert);
			userName = reply.userName ?? userName;
		} catch {
			const fallback = getBotResponse(userText, context);
			const parsed = parseBotMood(fallback.text);
			replyText = parsed.text;
			mood = hasBotMoodTag(fallback.text)
				? parsed.mood
				: resolveMoodFromIntent(fallback.intent);
			intent = fallback.intent;
			userName = fallback.userName ?? userName;
			showGithubAlert = intent === 'github_locked';
		}

		if (showGithubAlert) {
			pushToast(githubLockedMessage, 'info');
		}

		const delay = simulateTypingDelay(replyText, replySource);

		window.setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{ id: createId(), role: 'bot', text: replyText, mood },
			]);
			setBotContext((prev) => ({
				lastIntent: intent,
				turn: prev.turn + 1,
				userName,
			}));
			setTyping(false);
		}, delay);
	};

	const sendMessage = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || typing || editingId) return;

		setInput('');
		const nextMessages: BotMessage[] = [
			...messages,
			{ id: createId(), role: 'user', text: trimmed },
		];
		setMessages(nextMessages);
		setTyping(true);
		await requestReply(trimmed, nextMessages, botContext);
	};

	const copyMessage = async (message: BotMessage) => {
		try {
			await navigator.clipboard.writeText(message.text);
			setCopiedId(message.id);
			window.setTimeout(() => {
				setCopiedId((current) => (current === message.id ? null : current));
			}, 1400);
		} catch {
			pushToast('Could not copy message.', 'info');
		}
	};

	const deleteMessage = (messageId: string) => {
		if (typing) return;
		setEditingId(null);
		setMessages((prev) => {
			const index = prev.findIndex((item) => item.id === messageId);
			if (index < 0) return prev;

			const target = prev[index];
			if (target.role === 'user') {
				const next = prev[index + 1];
				const end =
					next?.role === 'bot' ? index + 2 : index + 1;
				const remaining = [...prev.slice(0, index), ...prev.slice(end)];
				return remaining.length > 0 ? remaining : [createGreeting()];
			}

			const remaining = prev.filter((item) => item.id !== messageId);
			return remaining.length > 0 ? remaining : [createGreeting()];
		});
	};

	const startEdit = (message: BotMessage) => {
		if (typing || message.role !== 'user') return;
		setEditingId(message.id);
		setEditDraft(message.text);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditDraft('');
	};

	const saveEdit = async () => {
		if (!editingId || typing) return;
		const trimmed = editDraft.trim();
		if (!trimmed) return;

		const index = messages.findIndex((item) => item.id === editingId);
		if (index < 0) return;

		const truncated = messages.slice(0, index);
		const edited: BotMessage = {
			id: createId(),
			role: 'user',
			text: trimmed,
		};
		const nextMessages = [...truncated, edited];

		setEditingId(null);
		setEditDraft('');
		setMessages(nextMessages);
		setTyping(true);
		await requestReply(trimmed, nextMessages, botContext);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		sendMessage(input);
	};

	return (
		<>
			{!open ? (
				<button
					type='button'
					className='ai-bot-fab ai-bot-interactive'
					onClick={() => setOpen(true)}
					aria-label='Open Bon AI chat'
					aria-expanded={false}
				>
					<span className='ai-bot-fab-globe'>
						<EarthFabGlobe />
					</span>
					<span
						className='ai-bot-fab-mark'
						aria-hidden='true'
					>
						<BonIcon
							size='fab'
							decorative
						/>
					</span>
				</button>
			) : null}

			{open && (
				<div className='ai-bot ai-bot-floating ai-bot-interactive'>
					<div className='ai-bot-header'>
						<div
							className={`ai-bot-avatar ai-bot-icon-animated ai-bot-avatar-mood-${activeMood}`}
						>
							<BonIcon size='avatar' />
						</div>

						<div className='ai-bot-header-copy'>
							<h3>{BOT_NAME}</h3>
							<p>{BOT_SUBTITLE}</p>
							<span
								className={`ai-bot-status ${typing ? 'ai-bot-status-typing' : ''}`}
								role='status'
								aria-live='polite'
							>
								<span
									className='ai-bot-status-dot'
									aria-hidden='true'
								/>
								{typing ? 'Typing...' : 'Online'}
								{!typing ? (
									<>
										<span
											className='ai-bot-status-sep'
											aria-hidden='true'
										>
											-
										</span>
										<BotMoodTag mood={activeMood} />
									</>
								) : null}
							</span>
						</div>

						<button
							type='button'
							className='ai-bot-close'
							onClick={() => setOpen(false)}
							aria-label='Close'
						>
							<FaXmark />
						</button>
					</div>

					<div
						className='ai-bot-body'
						ref={bodyRef}
					>
						{messages.map((msg) => {
							const isEditing = editingId === msg.id;

							return (
								<div
									key={msg.id}
									className={`ai-bot-msg ai-bot-msg-${msg.role}${isEditing ? ' ai-bot-msg-editing' : ''}`}
								>
									{msg.role === 'bot' && (
										<span className='ai-bot-msg-label'>
											<span>{BOT_NAME}</span>
											{msg.mood ? <BotMoodTag mood={msg.mood} /> : null}
										</span>
									)}

									{isEditing ? (
										<div className='ai-bot-edit'>
											<textarea
												ref={editInputRef}
												className='ai-bot-edit-input'
												value={editDraft}
												onChange={(e) => setEditDraft(e.target.value)}
												rows={3}
												aria-label='Edit message'
											/>
											<div className='ai-bot-edit-actions'>
												<button
													type='button'
													className='ai-bot-msg-action'
													onClick={cancelEdit}
													aria-label='Cancel edit'
												>
													<FaXmark />
													<span>Cancel</span>
												</button>
												<button
													type='button'
													className='ai-bot-msg-action ai-bot-msg-action-primary'
													onClick={() => {
														void saveEdit();
													}}
													disabled={!editDraft.trim()}
													aria-label='Save and resend'
												>
													<FaCheck />
													<span>Save</span>
												</button>
											</div>
										</div>
									) : (
										<>
											<div className='ai-bot-bubble'>
												{renderText(msg.text)}
											</div>
											<div className='ai-bot-msg-actions'>
												<button
													type='button'
													className='ai-bot-msg-action'
													onClick={() => {
														void copyMessage(msg);
													}}
													aria-label='Copy message'
													title='Copy'
												>
													{copiedId === msg.id ? <FaCheck /> : <FaCopy />}
													<span>
														{copiedId === msg.id ? 'Copied' : 'Copy'}
													</span>
												</button>
												{msg.role === 'user' ? (
													<button
														type='button'
														className='ai-bot-msg-action'
														onClick={() => startEdit(msg)}
														disabled={typing}
														aria-label='Edit message'
														title='Edit'
													>
														<FaPen />
														<span>Edit</span>
													</button>
												) : null}
												<button
													type='button'
													className='ai-bot-msg-action ai-bot-msg-action-danger'
													onClick={() => deleteMessage(msg.id)}
													disabled={typing}
													aria-label='Delete message'
													title='Delete'
												>
													<FaTrash />
													<span>Delete</span>
												</button>
											</div>
										</>
									)}
								</div>
							);
						})}
						{typing && (
							<div className='ai-bot-msg ai-bot-msg-bot'>
								<span className='ai-bot-msg-label'>
									<span>{BOT_NAME}</span>
									<span className='ai-bot-mood-tag ai-bot-mood-tag-typing'>
										<span
											className='ai-bot-mood-dot'
											aria-hidden='true'
										/>
										Typing
									</span>
								</span>
								<div className='ai-bot-bubble ai-bot-typing'>
									<span />
									<span />
									<span />
								</div>
							</div>
						)}
					</div>

					<div className='ai-bot-prompts ai-bot-prompts-compact'>
						{botQuickPrompts.map((prompt) => (
							<button
								key={prompt}
								type='button'
								onClick={() => sendMessage(prompt)}
								disabled={typing || Boolean(editingId)}
							>
								{prompt}
							</button>
						))}
					</div>

					<form
						className='ai-bot-input'
						onSubmit={handleSubmit}
					>
						<input
							type='text'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder='Ask Bon anything...'
							disabled={typing || Boolean(editingId)}
						/>
						<button
							type='submit'
							disabled={typing || Boolean(editingId) || !input.trim()}
							aria-label='Send message'
						>
							<FaPaperPlane />
						</button>
					</form>
				</div>
			)}
		</>
	);
};
