import { type FormEvent, useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaXmark } from 'react-icons/fa6';
import { BrandLogo } from './brand-logo';
import {
	botGreeting,
	botQuickPrompts,
	getBotResponse,
	simulateTypingDelay,
	type BotContext,
	type BotMessage,
} from '../lib/ai-bot-responses';

const createId = () => crypto.randomUUID();

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

export const AiBot = () => {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const [typing, setTyping] = useState(false);
	const [messages, setMessages] = useState<BotMessage[]>([
		{ id: createId(), role: 'bot', text: botGreeting },
	]);
	const [botContext, setBotContext] = useState<BotContext>({
		lastIntent: null,
		turn: 0,
	});
	const bodyRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		const el = bodyRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, typing]);

	const sendMessage = (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || typing) return;

		setInput('');
		setMessages((prev) => [
			...prev,
			{ id: createId(), role: 'user', text: trimmed },
		]);
		setTyping(true);

		const { text: reply, intent, userName } = getBotResponse(trimmed, botContext);
		const delay = simulateTypingDelay(reply);

		window.setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{ id: createId(), role: 'bot', text: reply },
			]);
			setBotContext((prev) => ({
				lastIntent: intent,
				turn: prev.turn + 1,
				userName: userName ?? prev.userName,
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
			<button
				type='button'
				className={`ai-bot-fab ai-bot-interactive ${open ? 'ai-bot-fab-open' : ''}`}
				onClick={() => setOpen((v) => !v)}
				aria-label={open ? 'Close AI chat' : 'Open AI chat'}
			>
				{open ? <FaXmark /> : <BrandLogo size={34} className='ai-bot-fab-logo' />}
				{!open && <span className='ai-bot-fab-ring' />}
			</button>

			{open && (
				<div className='ai-bot ai-bot-floating ai-bot-interactive'>
					<div className='ai-bot-header'>
						<div className='ai-bot-avatar ai-bot-icon-animated'>
							<BrandLogo size={34} className='ai-bot-header-logo' />
							<span className='ai-bot-pulse' />
						</div>
						<div>
							<h3>BC AI Chat</h3>
							<p>Ben&apos;s portfolio assistant</p>
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
									<span className='ai-bot-msg-label'>BC AI</span>
								)}
								<div className='ai-bot-bubble'>{renderText(msg.text)}</div>
							</div>
						))}
						{typing && (
							<div className='ai-bot-msg ai-bot-msg-bot'>
								<span className='ai-bot-msg-label'>BC AI</span>
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
							placeholder='Ask me anything…'
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
