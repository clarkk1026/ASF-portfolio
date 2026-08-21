import { useEffect, useState } from 'react';
import {
	Navigate,
	Outlet,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';
import { AiBot } from './components/ai-bot';
import { HexBg } from './components/hex-bg';
import { MouseTrail } from './components/mouse-trail';
import { Navbar } from './components/navbar';
import { PageKeyNav } from './components/page-key-nav';
import { ScrollBar } from './components/scroll-bar';
import { ScrollToTop } from './components/scroll-to-top';
import { SiteFooter } from './components/site-footer';
import { SiteLock } from './components/site-lock';
import { FallingStarsLayer, StarfieldBg } from './components/starfield-bg';
import { ToastProvider } from './components/toast-provider';
import { checkSiteUnlock } from './lib/site-passkey';
import { AboutPage } from './pages/about-page';
import { ContactPage } from './pages/contact-page';
import { ExpertisePage } from './pages/expertise-page';
import { HomePage } from './pages/home-page';
import { PathPage } from './pages/path-page';
import { ProjectsPage } from './pages/projects-page';
import { TeamPage } from './pages/team-page';
import { TechPage } from './pages/tech-page';
import { VoicesPage } from './pages/voices-page';
import './styles/about-me.css';
import './styles/ai-bot.css';
import './styles/earth-fab-globe.css';
import './styles/brand-logo.css';
import './styles/comet-btn.css';
import './styles/contact.css';
import './styles/experience.css';
import './styles/expertise.css';
import './styles/glow-box.css';
import './styles/hex-bg.css';
import './styles/hero-name-3d.css';
import './styles/home-aurora.css';
import './styles/info-section.css';
import './styles/layered-title.css';
import './styles/mouse-trail.css';
import './styles/navbar.css';
import './styles/page-shell.css';
import './styles/projects.css';
import './styles/reveal.css';
import './styles/scroll-bar.css';
import './styles/site-footer.css';
import './styles/site-lock.css';
import './styles/starfield-bg.css';
import './styles/team.css';
import './styles/tech-stack.css';
import './styles/visitor-note.css';
import './styles/visitor-contact.css';

const SiteShell = () => {
	const { pathname } = useLocation();
	const isHome = pathname === '/';

	return (
		<>
			<ScrollToTop />
			<PageKeyNav />
			{/* Contact-style starfield everywhere except home */}
			{!isHome && <StarfieldBg />}
			<HexBg />
			<ScrollBar />
			{/* Stylish custom cursor kept on all pages */}
			<MouseTrail />
			<Navbar />
			<Outlet />
			<SiteFooter />
			<FallingStarsLayer />
			<AiBot />
		</>
	);
};

function App() {
	const [gate, setGate] = useState<'checking' | 'locked' | 'open'>('checking');

	useEffect(() => {
		let cancelled = false;
		void checkSiteUnlock().then((unlocked) => {
			if (!cancelled) setGate(unlocked ? 'open' : 'locked');
		});
		return () => {
			cancelled = true;
		};
	}, []);

	if (gate === 'checking') {
		return <div className='site-lock site-lock-checking' aria-busy='true' />;
	}

	if (gate === 'locked') {
		return <SiteLock onUnlock={() => setGate('open')} />;
	}

	return (
		<ToastProvider>
			<Routes>
				<Route element={<SiteShell />}>
					<Route
						index
						element={<HomePage />}
					/>
					<Route
						path='about'
						element={<AboutPage />}
					/>
					<Route
						path='team'
						element={<TeamPage />}
					/>
					<Route
						path='expertise'
						element={<ExpertisePage />}
					/>
					<Route
						path='path'
						element={<PathPage />}
					/>
					<Route
						path='projects'
						element={<ProjectsPage />}
					/>
					<Route
						path='tech'
						element={<TechPage />}
					/>
					<Route
						path='voices'
						element={<VoicesPage />}
					/>
					<Route
						path='contact'
						element={<ContactPage />}
					/>
					<Route
						path='*'
						element={
							<Navigate
								to='/'
								replace
							/>
						}
					/>
				</Route>
			</Routes>
		</ToastProvider>
	);
}

export default App;
