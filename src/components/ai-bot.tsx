import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
import { BonIcon } from './bon-icon';
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
	const [messages, setMessages] = useState<BotMessage[]>([
		{
			id: createId(),
			role: 'bot',
			text: greetingParsed.text,
			mood: greetingParsed.mood,
		},
	]);
	const [botContext, setBotContext] = useState<BotContext>({
		lastIntent: null,
		turn: 0,
	});
	const bodyRef = useRef<HTMLDivElement>(null);

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

	const sendMessage = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || typing) return;

		setInput('');
		const nextMessages: BotMessage[] = [
			...messages,
			{ id: createId(), role: 'user', text: trimmed },
		];
		setMessages(nextMessages);
		setTyping(true);

		let replyText = '';
		let intent = 'fallback';
		let userName = botContext.userName;
		let mood: BotMood = 'calm';
		let showGithubAlert = false;
		let replySource: 'gemini' | 'local' = 'local';

		try {
			const reply = await fetchBotReply(trimmed, nextMessages, botContext);
			replySource = reply.source;
			const parsed = parseBotMood(reply.text);
			replyText = parsed.text;
			mood =
				reply.mood ??
				(hasBotMoodTag(reply.text) ? parsed.mood : resolveMoodFromIntent(reply.intent));
			intent = reply.intent;
			showGithubAlert = Boolean(reply.showGithubAlert);
		} catch {
			const fallback = getBotResponse(trimmed, botContext);
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

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		sendMessage(input);
	};

	return (
		<>
			{!open ? (
				<button
					type='button'
					className='comet-btn comet-btn-chatbot ai-bot-fab ai-bot-interactive'
					onClick={() => setOpen(true)}
					aria-label='Open Bon chat'
					aria-expanded={false}
				>
					<BonIcon
						size='fab'
						decorative
					/>
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
								{typing ? 'Typing…' : 'Online'}
								{!typing ? (
									<>
										<span
											className='ai-bot-status-sep'
											aria-hidden='true'
										>
											·
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
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`ai-bot-msg ai-bot-msg-${msg.role}`}
							>
								{msg.role === 'bot' && (
									<span className='ai-bot-msg-label'>
										<span>{BOT_NAME}</span>
										{msg.mood ? <BotMoodTag mood={msg.mood} /> : null}
									</span>
								)}
								<div className='ai-bot-bubble'>{renderText(msg.text)}</div>
							</div>
						))}
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
								disabled={typing}
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
							placeholder='Ask Bon anything…'
							disabled={typing}
						/>
						<button
							type='submit'
							disabled={typing || !input.trim()}
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
