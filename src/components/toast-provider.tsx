import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import '../styles/toast.css';

export type ToastKind = 'info' | 'success' | 'activity';

export type ToastItem = {
	id: string;
	message: string;
	kind: ToastKind;
};

type ToastContextValue = {
	pushToast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_LIFETIME_MS = 5200;
const TOAST_EXIT_MS = 340;

const toastLabels: Record<ToastKind, string> = {
	info: 'Notice',
	success: 'Saved',
	activity: 'Live update',
};

const ToastIcon = ({ kind }: { kind: ToastKind }) => {
	if (kind === 'success') {
		return (
			<svg
				className='toast-icon'
				viewBox='0 0 24 24'
				aria-hidden='true'
			>
				<circle
					cx='12'
					cy='12'
					r='10'
					fill='currentColor'
					opacity='0.14'
				/>
				<path
					d='M8.5 12.2l2.4 2.4 5.1-5.2'
					fill='none'
					stroke='currentColor'
					strokeWidth='1.8'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		);
	}

	if (kind === 'activity') {
		return (
			<svg
				className='toast-icon'
				viewBox='0 0 24 24'
				aria-hidden='true'
			>
				<circle
					cx='12'
					cy='12'
					r='10'
					fill='currentColor'
					opacity='0.14'
				/>
				<path
					d='M12 7v5l3 2'
					fill='none'
					stroke='currentColor'
					strokeWidth='1.8'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		);
	}

	return (
		<svg
			className='toast-icon'
			viewBox='0 0 24 24'
			aria-hidden='true'
		>
			<circle
				cx='12'
				cy='12'
				r='10'
				fill='currentColor'
				opacity='0.14'
			/>
			<path
				d='M12 8.2v4.4M12 15.4h.01'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
			/>
		</svg>
	);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
	const exitingIdsRef = useRef<Set<string>>(new Set());
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
		new Map(),
	);
	const exitTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
		new Map(),
	);

	const removeToast = useCallback((id: string) => {
		const timer = timersRef.current.get(id);
		if (timer) {
			clearTimeout(timer);
			timersRef.current.delete(id);
		}

		const exitTimer = exitTimersRef.current.get(id);
		if (exitTimer) {
			clearTimeout(exitTimer);
			exitTimersRef.current.delete(id);
		}

		setExitingIds((current) => {
			if (!current.has(id)) return current;
			const next = new Set(current);
			next.delete(id);
			exitingIdsRef.current = next;
			return next;
		});
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const dismissToast = useCallback(
		(id: string) => {
			if (exitingIdsRef.current.has(id)) return;

			const timer = timersRef.current.get(id);
			if (timer) {
				clearTimeout(timer);
				timersRef.current.delete(id);
			}

			exitingIdsRef.current.add(id);
			setExitingIds(new Set(exitingIdsRef.current));

			const exitTimer = setTimeout(() => removeToast(id), TOAST_EXIT_MS);
			exitTimersRef.current.set(id, exitTimer);
		},
		[removeToast],
	);

	const pushToast = useCallback(
		(message: string, kind: ToastKind = 'info') => {
			const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
			setToasts((current) => [...current.slice(-4), { id, message, kind }]);

			const timer = setTimeout(() => dismissToast(id), TOAST_LIFETIME_MS);
			timersRef.current.set(id, timer);
		},
		[dismissToast],
	);

	useEffect(
		() => () => {
			for (const timer of timersRef.current.values()) {
				clearTimeout(timer);
			}
			for (const timer of exitTimersRef.current.values()) {
				clearTimeout(timer);
			}
			timersRef.current.clear();
			exitTimersRef.current.clear();
		},
		[],
	);

	const hasToasts = toasts.length > 0;

	return (
		<ToastContext.Provider value={{ pushToast }}>
			{children}
			{hasToasts ? (
				<div className='toast-overlay'>
					<button
						type='button'
						className='toast-backdrop'
						aria-label='Dismiss notification'
						onClick={() => {
							const latest = toasts[toasts.length - 1];
							if (latest) dismissToast(latest.id);
						}}
					/>
					<div
						className='toast-stack'
						aria-live='polite'
						aria-relevant='additions'
					>
						{toasts.map((toast) => (
							<div
								key={toast.id}
								className={`toast toast-${toast.kind}${exitingIds.has(toast.id) ? ' toast-out' : ''}`}
								role='alertdialog'
								aria-labelledby={`toast-title-${toast.id}`}
								aria-describedby={`toast-body-${toast.id}`}
							>
								<div className='toast-accent' aria-hidden='true' />
								<div className='toast-icon-wrap'>
									<ToastIcon kind={toast.kind} />
								</div>
								<p
									id={`toast-title-${toast.id}`}
									className='toast-label'
								>
									{toastLabels[toast.kind]}
								</p>
								<p
									id={`toast-body-${toast.id}`}
									className='toast-message'
								>
									{toast.message}
								</p>
								<button
									type='button'
									className='toast-action'
									onClick={() => dismissToast(toast.id)}
								>
									Got it
								</button>
							</div>
						))}
					</div>
				</div>
			) : null}
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within ToastProvider');
	}
	return context;
};
