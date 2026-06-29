import { AiBot } from './components/ai-bot';
import { CosmicClock } from './components/cosmic-clock';
import { ToastProvider } from './components/toast-provider';
import { HexBg } from './components/hex-bg';
import { MouseTrail } from './components/mouse-trail';
import { Navbar } from './components/navbar';
import { ScrollBar } from './components/scroll-bar';
import { FallingStarsLayer, StarfieldBg } from './components/starfield-bg';
import { AboutMe } from './sections/about-me.section';
import { Contact } from './sections/contact.section';
import { WorkExperience } from './sections/experience.section';
import { Expertise } from './sections/expertise.section';
import { InfoSection } from './sections/info.section';
import { Projects } from './sections/projects.section';
import { VisitorNote } from './sections/visitor-note.section';
import { TechStack } from './sections/tech-stack.section';
import './styles/about-me.css';
import './styles/ai-bot.css';
import './styles/brand-logo.css';
import './styles/comet-btn.css';
import './styles/contact.css';
import './styles/experience.css';
import './styles/expertise.css';
import './styles/glow-box.css';
import './styles/hex-bg.css';
import './styles/hero-name-3d.css';
import './styles/info-section.css';
import './styles/layered-title.css';
import './styles/mouse-trail.css';
import './styles/navbar.css';
import './styles/projects.css';
import './styles/reveal.css';
import './styles/scroll-bar.css';
import './styles/starfield-bg.css';
import './styles/tech-stack.css';
import './styles/visitor-note.css';

function App() {
	return (
		<ToastProvider>
			<StarfieldBg />
			<HexBg />
			<ScrollBar />
			<MouseTrail />
			<Navbar />
			<InfoSection />
			<AboutMe />
			<Expertise />
			<WorkExperience />
			<Projects />
			<TechStack />
			<VisitorNote />
			<Contact />
			<FallingStarsLayer />
			<CosmicClock />
			<AiBot />
		</ToastProvider>
	);
}

export default App;
