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
        icon: '⚙️',
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
        icon: '🧠',
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
        icon: '🔮',
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
        icon: '🎮'
    },
    {
        title: 'ROS 2 Humble',
        desc: 'Industrial grade middleware for low-latency robot control.',
        icon: '🐢'
    },
    {
        title: 'PyTorch',
        desc: 'The leading deep learning research framework for training policies.',
        icon: '🔥'
    },
    {
        title: 'Docker',
        desc: 'Containerization ensures your agents run identically everywhere.',
        icon: '🐳'
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
                                <span className={styles.checkIcon}>✓</span> {feature}
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
                            <span className={styles.badge}>🚀 Open Source</span>
                            <span className={styles.badge}>🤖 Co-Learning with AI</span>
                            <span className={styles.badge}>⚡ Spec-Driven</span>
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
                                to="https://github.com/sumair-khan21/Physical-AI-Humanoid-Robotics">
                                Explore Code 🧑‍💻
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
