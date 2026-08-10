import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { visitorNote } from '../data/portfolio';
import { submitVisitorContact } from '../lib/visitor-contact-api';
import {
	VISITOR_CONTACT_CHANNELS,
	type VisitorContactChannel,
} from '../lib/visitor-contact-types';
import { useToast } from './toast-provider';

const CHANNEL_LABELS: Record<VisitorContactChannel, string> = {
	whatsapp: 'WhatsApp',
	telegram: 'Telegram',
	email: 'Email',
	discord: 'Discord',
	phone: 'Phone',
	linkedin: 'LinkedIn',
	other: 'Other',
};

const CHANNEL_PLACEHOLDERS: Record<VisitorContactChannel, string> = {
	whatsapp: '+1 555 000 0000',
	telegram: '@username',
	email: 'you@example.com',
	discord: 'username',
	phone: '+1 555 000 0000',
	linkedin: 'linkedin.com/in/you',
	other: 'Any contact details',
};

type VisitorContactModalProps = {
	open: boolean;
	onClose: () => void;
};

export const VisitorContactModal = ({
	open,
	onClose,
}: VisitorContactModalProps) => {
	const { pushToast } = useToast();
	const titleId = useId();
	const nameRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState('');
	const [channel, setChannel] =
		useState<VisitorContactChannel>('whatsapp');
	const [value, setValue] = useState('');
	const [note, setNote] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!open) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const timer = window.setTimeout(() => nameRef.current?.focus(), 40);
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !submitting) onClose();
		};
		window.addEventListener('keydown', onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.clearTimeout(timer);
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [open, onClose, submitting]);

	if (!open) return null;

	const onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (submitting) return;

		const trimmedName = name.trim();
		const trimmedValue = value.trim();
		if (!trimmedName || !trimmedValue) {
			setError('Please add your name and contact details.');
			return;
		}

		setSubmitting(true);
		setError('');
		try {
			const result = await submitVisitorContact({
				name: trimmedName,
				channel,
				value: trimmedValue,
				note,
			});
			pushToast(result.message || visitorNote.contactThanks, 'success');
			setName('');
			setValue('');
			setNote('');
			setChannel('whatsapp');
			onClose();
		} catch (submitError) {
			setError(
				submitError instanceof Error
					? submitError.message
					: 'Could not save contact info.',
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div
			className='visitor-contact-modal-root visitor-note-interactive'
			role='presentation'
		>
			<button
				type='button'
				className='visitor-contact-modal-backdrop'
				aria-label='Close contact form'
				onClick={() => {
					if (!submitting) onClose();
				}}
			/>
			<div
				className='visitor-contact-modal'
				role='dialog'
				aria-modal='true'
				aria-labelledby={titleId}
				onWheel={(event) => event.stopPropagation()}
				onTouchMove={(event) => event.stopPropagation()}
			>
				<header className='visitor-contact-modal-header'>
					<div>
						<h2 id={titleId}>{visitorNote.contactModalTitle}</h2>
						<p>{visitorNote.contactModalSubtext}</p>
					</div>
					<button
						type='button'
						className='visitor-contact-modal-close'
						onClick={onClose}
						disabled={submitting}
						aria-label='Close'
					>
						<FaXmark />
					</button>
				</header>

				<form
					className='visitor-contact-form'
					onSubmit={(event) => {
						void onSubmit(event);
					}}
				>
					<label className='visitor-contact-field'>
						<span>Name</span>
						<input
							ref={nameRef}
							type='text'
							name='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={visitorNote.contactNamePlaceholder}
							autoComplete='name'
							maxLength={64}
							disabled={submitting}
							required
						/>
					</label>

					<fieldset className='visitor-contact-field visitor-contact-channels'>
						<legend>{visitorNote.contactChannelLabel}</legend>
						<div
							className='visitor-contact-channel-list'
							role='radiogroup'
							aria-label={visitorNote.contactChannelLabel}
						>
							{VISITOR_CONTACT_CHANNELS.map((item) => {
								const active = channel === item;
								return (
									<button
										key={item}
										type='button'
										role='radio'
										aria-checked={active}
										className={`visitor-contact-channel${active ? ' is-active' : ''}`}
										onClick={() => setChannel(item)}
										disabled={submitting}
									>
										{CHANNEL_LABELS[item]}
									</button>
								);
							})}
						</div>
					</fieldset>

					<label className='visitor-contact-field'>
						<span>Contact</span>
						<input
							type='text'
							name='value'
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder={
								CHANNEL_PLACEHOLDERS[channel] ||
								visitorNote.contactValuePlaceholder
							}
							autoComplete='off'
							maxLength={160}
							disabled={submitting}
							required
						/>
					</label>

					<label className='visitor-contact-field'>
						<span>Note</span>
						<textarea
							name='note'
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder={visitorNote.contactNotePlaceholder}
							rows={3}
							maxLength={400}
							disabled={submitting}
						/>
					</label>

					{error ? (
						<p
							className='visitor-contact-error'
							role='alert'
						>
							{error}
						</p>
					) : null}

					<div className='visitor-contact-actions'>
						<button
							type='button'
							className='visitor-contact-cancel'
							onClick={onClose}
							disabled={submitting}
						>
							{visitorNote.contactCancelLabel}
						</button>
						<button
							type='submit'
							className='comet-btn comet-btn-talk visitor-contact-submit'
							disabled={submitting}
						>
							{submitting
								? visitorNote.contactSubmittingLabel
								: visitorNote.contactSubmitLabel}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
