import { AiBot } from './components/ai-bot';
import { GlobeWorld } from './components/globe-world';
import { HexBg } from './components/hex-bg';
import { MouseTrail } from './components/mouse-trail';
import { Navbar } from './components/navbar';
import { ScrollBar } from './components/scroll-bar';
import { FallingStarsLayer, StarfieldBg } from './components/starfield-bg';
import { GlobeProvider } from './lib/globe-context';
import { AboutMe } from './sections/about-me.section';
import { Contact } from './sections/contact.section';
import { WorkExperience } from './sections/experience.section';
import { Expertise } from './sections/expertise.section';
import { InfoSection } from './sections/info.section';
import { Projects } from './sections/projects.section';
import { TechStack } from './sections/tech-stack.section';
import './styles/about-me.css';
import './styles/ai-bot.css';
import './styles/contact.css';
import './styles/experience.css';
import './styles/expertise.css';
import './styles/globe-world.css';
import './styles/glow-box.css';
import './styles/hex-bg.css';
import './styles/info-section.css';
import './styles/layered-title.css';
import './styles/mouse-trail.css';
import './styles/navbar.css';
import './styles/projects.css';
import './styles/reveal.css';
import './styles/starfield-bg.css';
import './styles/tech-stack.css';
import './styles/text-hover.css';
import './styles/title.css';

function App() {
	return (
		<GlobeProvider>
			<StarfieldBg />
			<HexBg />
			<ScrollBar />
			<MouseTrail />
			<Navbar />
			<GlobeWorld
				panels={[
					{ id: 'home', label: 'Home', content: <InfoSection /> },
					{ id: 'about-me', label: 'About', content: <AboutMe /> },
					{ id: 'expertise', label: 'Expertise', content: <Expertise /> },
					{ id: 'experience', label: 'Experience', content: <WorkExperience /> },
					{ id: 'projects', label: 'Projects', content: <Projects /> },
					{ id: 'tech-stack', label: 'Tech Stack', content: <TechStack /> },
					{ id: 'contact', label: 'Contact', content: <Contact /> },
				]}
			/>
			<FallingStarsLayer />
			<AiBot />
		</GlobeProvider>
	);
}

export default App;
