import { HeroName3D } from '../components/hero-name-3d';
import { Reveal } from '../components/reveal';
import { highlights, personal, team } from '../data/portfolio';

export const InfoSection = () => {
	return (
		<section
			className='hero-section'
			id='home'
		>
			<div className='hero-orbs' aria-hidden='true'>
				<span className='hero-orb hero-orb-1' />
				<span className='hero-orb hero-orb-2' />
				<span className='hero-orb hero-orb-3' />
			</div>

			<div className='hero-content'>
				<Reveal delay={0}>
					<p className='hero-greeting'>{personal.greeting}</p>
				</Reveal>

				<Reveal delay={100}>
					<div className='hero-title'>
						<HeroName3D lines={personal.heroNameLines} />
					</div>
				</Reveal>

				<Reveal delay={180}>
					<p className='hero-lead'>{personal.heroLead}</p>
				</Reveal>

				<Reveal delay={260}>
					<p className='hero-tagline'>{personal.tagline}</p>
				</Reveal>

				<Reveal delay={340}>
					<div className='hero-actions'>
						<a
							href='#projects'
							className='comet-btn comet-btn-work comet-btn-lg'
						>
							View Our Work
						</a>
						<a
							href='#team'
							className='comet-btn comet-btn-contact comet-btn-lg'
						>
							Meet the Team
						</a>
					</div>
				</Reveal>

				<Reveal delay={460}>
					<div className='hero-stats'>
						{highlights.map((item) => (
							<div
								className='hero-stat'
								key={item.label}
							>
								<span className='hero-stat-value'>{item.value}</span>
								<span className='hero-stat-label'>{item.label}</span>
							</div>
						))}
					</div>
				</Reveal>

				<Reveal delay={540}>
					<p className='hero-team-note'>
						{team.model}
					</p>
				</Reveal>
			</div>

			<div className='blur' />
		</section>
	);
};
