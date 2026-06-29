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

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
		new Map(),
	);

	const dismissToast = useCallback((id: string) => {
		const timer = timersRef.current.get(id);
		if (timer) {
			clearTimeout(timer);
			timersRef.current.delete(id);
		}
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

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
			timersRef.current.clear();
		},
		[],
	);

	return (
		<ToastContext.Provider value={{ pushToast }}>
			{children}
			<div
				className='toast-stack'
				aria-live='polite'
				aria-relevant='additions'
			>
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={`toast toast-${toast.kind}`}
						role='status'
					>
						<p>{toast.message}</p>
						<button
							type='button'
							className='toast-dismiss'
							onClick={() => dismissToast(toast.id)}
							aria-label='Dismiss notification'
						>
							×
						</button>
					</div>
				))}
			</div>
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
