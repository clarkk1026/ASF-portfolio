import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { team, teamMembers, teamSection } from '../data/portfolio';

export const Team = () => {
	return (
		<section
			className='team container'
			id='team'
		>
			<div className='section-sidebar team-title'>
				<LayeredSectionTitle
					primary={teamSection.section.title}
					secondary={teamSection.section.subtitle}
					summary={teamSection.section.summary}
				/>
			</div>

			<div className='team-content'>
				<p className='team-remote-note'>{team.model}.</p>

				<div className='team-grid'>
					{teamMembers.map((member, idx) => (
						<Reveal
							key={member.id}
							delay={idx * 80}
						>
							<article
								className={`team-card glass-card${member.isLeader ? ' team-card-leader' : ''}`}
							>
								<header className='team-card-header'>
									<div className='team-card-identity'>
										<h3>{member.name}</h3>
										<p className='team-card-role'>{member.role}</p>
									</div>
									{member.isLeader ? (
										<span className='team-card-badge'>Founder</span>
									) : null}
								</header>

								<p className='team-card-location'>
									{member.location}
									{member.age != null ? ` · ${member.age}` : ''}
								</p>
								<p className='team-card-summary'>{member.summary}</p>

								<div className='team-card-focus'>
									{member.focus.map((tag) => (
										<span key={tag}>{tag}</span>
									))}
								</div>
							</article>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
};
