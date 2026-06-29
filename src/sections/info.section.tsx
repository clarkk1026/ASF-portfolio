import { GlowLink } from '../components/glow-box-link';
import { HeroName3D } from '../components/hero-name-3d';
import { Reveal } from '../components/reveal';
import { RoleRotator } from '../components/role-rotator';
import { highlights, personal, socialLinks } from '../data/portfolio';

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
					<p className='hero-eyebrow'>
						<span className='hero-status-dot' />
						Available for new opportunities · {personal.location}
					</p>
				</Reveal>

				<Reveal delay={100}>
					<p className='hero-greeting'>{personal.greeting}</p>
				</Reveal>

				<Reveal delay={200}>
					<div className='hero-title'>
						<HeroName3D text={personal.name} />
					</div>
				</Reveal>

				<Reveal delay={320}>
					<p className='hero-subtitle'>
						<RoleRotator roles={personal.roles} />
					</p>
				</Reveal>

				<Reveal delay={440}>
					<p className='hero-tagline'>{personal.tagline}</p>
				</Reveal>

				<Reveal delay={560}>
					<div className='hero-actions'>
						<a
							href='#projects'
							className='hero-btn hero-btn-primary'
						>
							View My Work
						</a>
						<a
							href='#contact'
							className='hero-btn hero-btn-secondary'
						>
							Contact Me
						</a>
					</div>
				</Reveal>

				<Reveal delay={680}>
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
			</div>

			<div className='blur' />

			<div className='bottom-bar'>
				{socialLinks.map((link) => (
					<GlowLink
						key={link.label}
						href={link.href}
						color={link.glowColor}
						icon={<link.icon color={link.iconColor} />}
						aria-label={link.label.toLowerCase()}
					/>
				))}
			</div>

			<a
				href='#about-me'
				className='hero-scroll'
				aria-label='Scroll to about section'
			>
				<span className='hero-scroll-line' />
				<span>Scroll</span>
			</a>
		</section>
	);
};
