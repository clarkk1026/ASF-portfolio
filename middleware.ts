/**
 * Edge gate: without a signed unlock cookie, the SPA and assets are never served.
 * Passkey lives only in SITE_PASSKEY (server env) — never in the client bundle.
 */

const GATE_COOKIE = 'asf_gate';
const GATE_VERSION = 'v1';

const textEncoder = new TextEncoder();

const getPasskey = () => (process.env.SITE_PASSKEY ?? '').trim();

const getSecret = () => {
	const explicit = (process.env.SITE_GATE_SECRET ?? '').trim();
	if (explicit) return explicit;
	const passkey = getPasskey();
	return passkey ? `asf-gate:${passkey}` : '';
};

const toHex = (buffer: ArrayBuffer) =>
	[...new Uint8Array(buffer)]
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

const hmacHex = async (secret: string, message: string) => {
	const key = await crypto.subtle.importKey(
		'raw',
		textEncoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const sig = await crypto.subtle.sign(
		'HMAC',
		key,
		textEncoder.encode(message),
	);
	return toHex(sig);
};

const timingSafeEqualHex = (a: string, b: string) => {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i += 1) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
};

const verifyGateToken = async (token: string | undefined, secret: string) => {
	if (!token || !secret) return false;
	const parts = token.split('.');
	if (parts.length !== 3) return false;
	const [version, expRaw, sig] = parts;
	if (version !== GATE_VERSION) return false;
	const exp = Number(expRaw);
	if (!Number.isFinite(exp) || Date.now() > exp) return false;
	const payload = `${version}.${expRaw}`;
	const expected = await hmacHex(secret, payload);
	return timingSafeEqualHex(sig, expected);
};

const readCookie = (req: Request, name: string) => {
	const raw = req.headers.get('cookie') ?? '';
	const match = raw
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`));
	if (!match) return undefined;
	return decodeURIComponent(match.slice(name.length + 1));
};

const LOCK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>ASF Team — Locked</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; margin: 0; padding: 0; cursor: auto; }
  body {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    font-family: "Open Sans", system-ui, sans-serif;
    cursor: auto;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(31,195,255,.14), transparent 55%),
      linear-gradient(180deg, #02070e 0%, #000 100%);
    color: #e8f7ff;
  }
  input { cursor: text; }
  button { cursor: pointer; }
  form {
    width: min(100%, 26rem);
    display: flex;
    flex-direction: column;
    gap: .75rem;
    padding: 2rem 1.75rem 1.85rem;
    border: 1px solid rgba(31,195,255,.22);
    background: rgba(4,12,22,.92);
    box-shadow: 0 24px 60px rgba(0,0,0,.55);
  }
  h1 {
    text-align: center;
    font-size: 1.35rem;
    letter-spacing: .18em;
    text-transform: uppercase;
  }
  p.copy {
    text-align: center;
    color: rgba(200,220,235,.72);
    font-size: .92rem;
    line-height: 1.45;
    margin-bottom: .35rem;
  }
  label {
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: rgba(31,195,255,.9);
  }
  input {
    width: 100%;
    padding: .85rem .95rem;
    border: 1px solid rgba(31,195,255,.28);
    background: rgba(0,0,0,.45);
    color: #f2fbff;
    font: inherit;
    outline: none;
  }
  input:focus {
    border-color: rgba(31,195,255,.7);
    box-shadow: 0 0 0 3px rgba(31,195,255,.12);
  }
  button {
    margin-top: .45rem;
    padding: .75rem 1.2rem;
    border: 1px solid rgba(31,195,255,.55);
    background: rgba(31,195,255,.14);
    color: #e8f7ff;
    font: inherit;
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
  }
  button:hover { background: rgba(31,195,255,.22); }
  button:disabled { opacity: .55; cursor: wait; }
  .err { color: #ff8f8f; font-size: .85rem; min-height: 1.2em; }
  .shake { animation: shake .42s ease; }
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-8px)}
    40%{transform:translateX(8px)}
    60%{transform:translateX(-5px)}
    80%{transform:translateX(5px)}
  }
</style>
</head>
<body>
<form id="lock" autocomplete="off">
  <h1>ASF Team</h1>
  <p class="copy">Enter the passkey to open the site.</p>
  <label for="passkey">Passkey</label>
  <input id="passkey" name="passkey" type="password" autofocus spellcheck="false" placeholder="Enter passkey" required/>
  <p class="err" id="err" role="alert"></p>
  <button type="submit" id="btn">Unlock</button>
</form>
<script>
(function () {
  var form = document.getElementById('lock');
  var input = document.getElementById('passkey');
  var err = document.getElementById('err');
  var btn = document.getElementById('btn');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.textContent = '';
    btn.disabled = true;
    fetch('/api/unlock', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey: input.value })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Unlock failed');
        location.reload();
      });
    }).catch(function (error) {
      err.textContent = error.message || 'Unlock failed';
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      btn.disabled = false;
    });
  });
})();
</script>
</body>
</html>`;

export default async function middleware(request: Request) {
	const url = new URL(request.url);
	const path = url.pathname;

	if (path === '/api/unlock') {
		return; // continue to API route
	}

	const secret = getSecret();
	const token = readCookie(request, GATE_COOKIE);
	const unlocked = await verifyGateToken(token, secret);

	if (unlocked) {
		return; // continue
	}

	if (path.startsWith('/api/')) {
		return new Response(JSON.stringify({ error: 'Site locked' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	}

	return new Response(LOCK_HTML, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}

export const config = {
	matcher: '/:path*',
};
