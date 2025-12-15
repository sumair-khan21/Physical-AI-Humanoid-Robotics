import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

// Spectrum Data
const SpectrumList = [
    {
        title: 'Classical Robotics',
        subtitle: 'Explicit Control',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.8 5.2l-4.2-4.2m0-6l4.2-4.2"/>
            </svg>
        ),
        description: (
            <>
                Traditional robotics relies on manually written control loops, state machines,
                and deterministic algorithms. Robust but limited in adaptability.
            </>
        ),
        features: [
            'PID Controllers & Inverse Kinematics',
            'Finite State Machines',
            'Explicit Motion Planning'
        ],
        example: 'Writing C++ nodes in ROS 2 to move a robot arm to a specific coordinate.',
        isFocus: false,
    },
    {
        title: 'Sim-to-Real AI',
        subtitle: 'Learned Behaviors',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
        ),
        description: (
            <>
                Agents typically trained via Deep Reinforcement Learning (DRL) in high-fidelity
                simulations (Isaac Sim) to master complex dynamics.
            </>
        ),
        features: [
            'Proximal Policy Optimization (PPO)',
            'Domain Randomization',
            'Massive Parallel Simulation'
        ],
        example: 'Training a quadruped to walk over rough terrain in NVIDIA Isaac Sim.',
        isFocus: true,
    },
    {
        title: 'Embodied Intel.',
        subtitle: 'Foundation Models',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        ),
        description: (
            <>
                The future of robotics: Vision-Language-Action (VLA) models that allow robots
                to reason, plan, and act from natural language.
            </>
        ),
        features: [
            'Multi-Modal LLMs',
            'Zero-Shot Generalization',
            'Semantic World Understanding'
        ],
        example: 'Asking a robot to "pick up the red apple" and having it infer the actions.',
        isFocus: true,
    },
];

const CurriculumList = [
    {
        module: '01',
        title: 'ROS 2 Spec-Driven Development',
        desc: 'Master the operating system of robots. Learn nodes, topics, and services through strict specifications.',
        tags: ['C++', 'Python', 'DDS'],
        color: '#6366f1' // Indigo
    },
    {
        module: '02',
        title: 'Simulation & Digital Twins',
        desc: 'Build photorealistic worlds in NVIDIA Isaac Sim and Gazebo to safely train your agents before deploying.',
        tags: ['Isaac Sim', 'USD', 'Physics'],
        color: '#8b5cf6' // Violet
    },
    {
        module: '03',
        title: 'Physical AI & VLA Models',
        desc: 'Integrate Large Language Models with robotic control. From prompt engineering to fine-tuning RT-X models.',
        tags: ['Transformers', 'PyTorch', 'VLA'],
        color: '#ec4899' // Pink
    }
];

const TechList = [
    {
        title: 'NVIDIA Isaac Sim',
        desc: 'Photorealistic, physics-accurate simulation environment for synthetic data.',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
            </svg>
        )
    },
    {
        title: 'ROS 2 Humble',
        desc: 'Industrial grade middleware for low-latency robot control.',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
            </svg>
        )
    },
    {
        title: 'PyTorch',
        desc: 'The leading deep learning research framework for training policies.',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
        )
    },
    {
        title: 'Docker',
        desc: 'Containerization ensures your agents run identically everywhere.',
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 13h6v6H2zm8 0h6v6h-6zm8 0h6v6h-6zM2 5h6v6H2zm8 0h6v6h-6zm8 0h6v6h-6z"/>
            </svg>
        )
    }
];

function SpectrumCard({ title, subtitle, icon, description, features, example, isFocus }) {
    return (
        <div className={clsx(styles.spectrumCol, 'col col--4')}>
            <div className={clsx(styles.spectrumCard, isFocus && styles.spectrumCardFocus)}>
                {isFocus && <div className={styles.focusBadge}>FOCUS OF THIS BOOK</div>}
                <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>{icon}</span>
                    <div className={styles.cardTitleWrap}>
                        <Heading as="h3" className={styles.cardTitle}>{title}</Heading>
                        <span className={styles.cardSubtitle}>{subtitle}</span>
                    </div>
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.cardDescription}>{description}</p>
                    <ul className={styles.featureList}>
                        {features.map((feature, idx) => (
                            <li key={idx} className={styles.featureItem}>
                                <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.exampleBox}>
                    <strong>Example:</strong> {example}
                </div>
            </div>
        </div>
    );
}

function CurriculumCard({ module, title, desc, tags, color }) {
    return (
        <div className={clsx('col col--4', styles.curriculumCol)}>
            <div className={styles.curriculumCard}>
                <div className={styles.curriculumNumber} style={{ color: color }}>{module}</div>
                <h3 className={styles.curriculumTitle}>{title}</h3>
                <p className={styles.curriculumDesc}>{desc}</p>
                <div className={styles.tagContainer}>
                    {tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function TechCard({ title, desc, icon }) {
    return (
        <div className={clsx('col col--3', styles.techCol)}>
            <div className={styles.techCard}>
                <div className={styles.techIcon}>{icon}</div>
                <h4 className={styles.techTitle}>{title}</h4>
                <p className={styles.techDesc}>{desc}</p>
            </div>
        </div>
    )
}

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={styles.heroBanner}>
            <div className="container">
                <div className={styles.heroGrid}>
                    <div className={styles.heroContent}>
                        <div className={styles.badgeContainer}>
                            <span className={styles.badge}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                                </svg>
                                Open Source
                            </span>
                            <span className={styles.badge}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="10" rx="2"/>
                                    <circle cx="12" cy="5" r="2"/>
                                    <path d="M12 7v4"/>
                                    <line x1="8" y1="16" x2="8" y2="16"/>
                                    <line x1="16" y1="16" x2="16" y2="16"/>
                                </svg>
                                Co-Learning with AI
                            </span>
                            <span className={styles.badge}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                                Spec-Driven
                            </span>
                        </div>
                        <Heading as="h1" className={styles.heroTitle}>
                            Physical AI & <br />
                            <span className={styles.heroTitleGradient}>Humanoid Robotics</span>
                        </Heading>
                        <p className={styles.heroSubtitle}>
                            A comprehensive guide to building autonomous agents with ROS 2,
                            NVIDIA Isaac Sim, and Foundation Models.
                        </p>
                        <div className={styles.buttons}>
                            <Link
                                className="button button--primary button--lg"
                                to="/docs/intro">
                                Start Reading Now →
                            </Link>
                            <Link
                                className="button button--secondary button--lg"
                                to="https://github.com/sumair-khan21/Physical-AI-Humanoid-Robotics"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                </svg>
                                Explore Code
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroImageContainer}>
                        <img
                            src="img/hero_asset.png"
                            alt="Physical AI Dashboard"
                            className={styles.heroImage}
                        />
                        <div className={styles.heroGlow}></div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Home | ${siteConfig.title}`}
            description="Physical AI & Humanoid Robotics Textbook">
            <HomepageHeader />
            <main>
                {/* Spectrum Section */}
                <section className={styles.spectrumSection}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionBadge}>EVOLUTION OF ROBOTICS</span>
                            <Heading as="h2" className={styles.sectionTitle}>The Intelligence Spectrum</Heading>
                            <p className={styles.sectionSubtitle}>
                                From rigid control systems to reasoning agents. This book bridges the gap between
                                classical engineering and modern AI.
                            </p>
                        </div>
                        <div className="row">
                            {SpectrumList.map((props, idx) => (
                                <SpectrumCard key={idx} {...props} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Curriculum Section */}
                <section className={styles.curriculumSection}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionBadge}>COURSE MODULES</span>
                            <Heading as="h2" className={styles.sectionTitle}>Structured Learning Path</Heading>
                            <p className={styles.sectionSubtitle}>
                                A step-by-step journey from the basics of ROS 2 nodes to deploying complex
                                Vision-Language-Action models on humanoid robots.
                            </p>
                        </div>
                        <div className="row">
                            {CurriculumList.map((props, idx) => (
                                <CurriculumCard key={idx} {...props} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className={styles.techSection}>
                    <div className="container">
                        <div className={styles.sectionHeader}>
                            <Heading as="h2" className={styles.sectionTitle}>Powered By Open Standards</Heading>
                            <p className={styles.sectionSubtitle}>Built on top of the most powerful simulations and frameworks in the industry.</p>
                        </div>
                        <div className="row">
                            {TechList.map((props, idx) => (
                                <TechCard key={idx} {...props} />
                            ))}
                        </div>
                    </div>
                </section>

                <section className={styles.ctaSection}>
                    <div className="container">
                        <div className={styles.ctaCard}>
                            <h2>Ready to Build the Future?</h2>
                            <p>Join the revolution of embodied intelligence today.</p>
                        </div>
                    </div>
                </section>
            </main>
        </Layout>
    );
}
