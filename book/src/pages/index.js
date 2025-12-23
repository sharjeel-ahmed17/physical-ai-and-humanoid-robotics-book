import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useAuth } from '../contexts/AuthContext';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {isAuthenticated() && user && (
          <div className={styles.welcomeMessage}>
            <span className={styles.waveEmoji}>👋</span> Welcome back, <strong>{user.email?.split('@')[0]}</strong>!
            {user.skill_level && (
              <span className={styles.skillBadge}>{user.skill_level}</span>
            )}
          </div>
        )}
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started 🚀
          </Link>
          <Link
            className="button button--primary button--lg margin-left--md"
            to="/docs/modules/module-1-ros2/week1-2-intro">
            Explore Modules
          </Link>
          {!isAuthenticated() && (
            <Link
              className="button button--outline button--lg margin-left--md"
              to="/auth/signup">
              Create Account
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

const CardList = () => {
  const cards = [
    {
      title: 'Module 1: Robotic Nervous System (ROS 2)',
      description: 'Weeks 1-5: Learn to implement robotic systems using ROS 2 framework',
      to: '/docs/modules/module-1-ros2/week1-2-intro',
      color: '#4285f4'
    },
    {
      title: 'Module 2: Digital Twin & Simulation',
      description: 'Weeks 6-7: Create and interact with digital twins for robotic systems',
      to: '/docs/modules/module-2-digital-twin/week6-7-gazebo-unity',
      color: '#34a853'
    },
    {
      title: 'Module 3: AI-Robot Brain',
      description: 'Weeks 8-10: Develop AI algorithms that control robotic behavior',
      to: '/docs/modules/module-3-ai-robot-brain/week8-10-nvidia-isaac',
      color: '#ea4335'
    },
    {
      title: 'Module 4: Vision-Language-Action Models',
      description: 'Weeks 11-13: Apply VLA models to robotic systems',
      to: '/docs/modules/module-4-vla/week11-12-humanoid-robot-dev',
      color: '#fbbc05'
    },
    {
      title: 'Hardware Requirements',
      description: 'Detailed hardware requirements for different implementation scenarios',
      to: '/docs/hardware-requirements/digital-twin-workstation',
      color: '#9c27b0'
    },
    {
      title: 'Learning Resources',
      description: 'Additional resources and references for deeper learning',
      to: '/docs/intro',
      color: '#607d8b'
    }
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {cards.map((card, index) => (
            <div key={index} className="col col--4 margin-bottom--lg">
              <div
                className={clsx('card', styles.card)}
                style={{borderLeft: `4px solid ${card.color}`}}
              >
                <div className="card__body">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <div className="card__footer">
                  <Link className="button button--secondary button--block" to={card.to}>
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureSection = () => {
  const features = [
    {
      title: '🎯 Learning Objectives',
      items: [
        'Understand fundamental principles of Physical AI',
        'Implement robotic systems using ROS 2 framework',
        'Create and interact with digital twins',
        'Develop AI algorithms for robotic behavior',
        'Apply Vision-Language-Action models',
        'Design humanoid robots for physical interaction'
      ]
    },
    {
      title: '📋 Course Prerequisites',
      items: [
        'Basic programming knowledge',
        'Understanding of mathematics fundamentals',
        'Familiarity with Linux/Unix systems (recommended)'
      ]
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className="container padding-vert--lg">
        <div className="row">
          {features.map((feature, index) => (
            <div key={index} className="col col--6">
              <div className={styles.featureCard}>
                <h2>{feature.title}</h2>
                <ul>
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className={styles.featureItem}>
                      <span className={styles.checkmark}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="A comprehensive textbook on Physical AI & Humanoid Robotics">
      <HomepageHeader />
      <main>
        <CardList />
        <FeatureSection />
      </main>
    </Layout>
  );
}