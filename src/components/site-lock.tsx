import { useState } from 'react';
import type { FormEvent } from 'react';
import { BrandLogo } from './brand-logo';
import { requestSiteUnlock } from '../lib/site-passkey';

type SiteLockProps = {
	onUnlock: () => void;
};

export const SiteLock = ({ onUnlock }: SiteLockProps) => {
	const [passkey, setPasskey] = useState('');
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);
	const [shaking, setShaking] = useState(false);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (busy) return;

		setBusy(true);
		setError('');

		const result = await requestSiteUnlock(passkey);
		if (!result.ok) {
			setError(result.error);
			setShaking(true);
			window.setTimeout(() => setShaking(false), 420);
			setBusy(false);
			return;
		}

		onUnlock();
	};

	return (
		<div
			className='site-lock'
			role='dialog'
			aria-modal='true'
			aria-labelledby='site-lock-title'
		>
			<div className='site-lock-bg' aria-hidden='true' />
			<form
				className={`site-lock-panel${shaking ? ' site-lock-panel-shake' : ''}`}
				onSubmit={handleSubmit}
			>
				<BrandLogo className='site-lock-logo' />
				<h1 id='site-lock-title'>ASF Team</h1>
				<p className='site-lock-copy'>Enter the passkey to open the site.</p>

				<label className='site-lock-label' htmlFor='site-passkey'>
					Passkey
				</label>
				<input
					id='site-passkey'
					className='site-lock-input'
					type='password'
					autoComplete='off'
					autoFocus
					spellCheck={false}
					disabled={busy}
					value={passkey}
					onChange={(event) => {
						setPasskey(event.target.value);
						if (error) setError('');
					}}
					placeholder='Enter passkey'
				/>

				{error ? (
					<p className='site-lock-error' role='alert'>
						{error}
					</p>
				) : null}

				<button
					type='submit'
					className='comet-btn comet-btn-talk site-lock-submit'
					disabled={busy}
				>
					{busy ? 'Checking…' : 'Unlock'}
				</button>
			</form>
		</div>
	);
};
