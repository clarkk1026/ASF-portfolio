import { HexBg } from './components/hex-bg';
import { FallingStarsLayer, StarfieldBg } from './components/starfield-bg';
import { AiBot } from './components/ai-bot';
import { MouseTrail } from './components/mouse-trail';
import { Navbar } from './components/navbar';
import { ScrollBar } from './components/scroll-bar';
import { AboutMe } from './sections/about-me.section';
import { Contact } from './sections/contact.section';
import { Expertise } from './sections/expertise.section';
import { WorkExperience } from './sections/experience.section';
import { InfoSection } from './sections/info.section';
import { Projects } from './sections/projects.section';
import { TechStack } from './sections/tech-stack.section';
import './styles/about-me.css';
import './styles/ai-bot.css';
import './styles/contact.css';
import './styles/experience.css';
import './styles/expertise.css';
import './styles/glow-box.css';
import './styles/info-section.css';
import './styles/mouse-trail.css';
import './styles/navbar.css';
import './styles/projects.css';
import './styles/layered-title.css';
import './styles/reveal.css';
import './styles/starfield-bg.css';
import './styles/hex-bg.css';
import './styles/tech-stack.css';
import './styles/text-hover.css';
import './styles/title.css';

function App() {
	return (
		<>
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
			<Contact />
			<FallingStarsLayer />
			<AiBot />
		</>
	);
}

export default App;
