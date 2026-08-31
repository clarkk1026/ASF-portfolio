import { LayeredSectionTitle } from '../components/layered-section-title';
import { Reveal } from '../components/reveal';
import { team, teamMembers, teamSection } from '../data/portfolio';

const initialsFor = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');

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
							delay={idx * 60}
						>
							<article
								className={`team-card glass-card${member.isLeader ? ' team-card-leader' : ''}`}
							>
								<header className='team-card-header'>
									<div className='team-card-avatar' aria-hidden='true'>
										{initialsFor(member.name)}
									</div>
									<div className='team-card-identity'>
										<div className='team-card-name-row'>
											<h3>{member.name}</h3>
											{member.badge ? (
												<span
													className={`team-card-badge${
														member.badgeTone
															? ` team-card-badge-${member.badgeTone}`
															: ''
													}`}
												>
													{member.badge}
												</span>
											) : null}
										</div>
										<p className='team-card-role'>{member.role}</p>
									</div>
								</header>

								<dl className='team-card-meta'>
									<div>
										<dt>Origin</dt>
										<dd>{member.birthPlace}</dd>
									</div>
									<div>
										<dt>Based</dt>
										<dd>{member.location}</dd>
									</div>
								</dl>

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
