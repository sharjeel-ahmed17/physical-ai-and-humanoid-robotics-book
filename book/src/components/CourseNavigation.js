import React from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { useDocsVersion } from '@docusaurus/plugin-content-docs/client';

function CourseNavigation(props) {
  const location = useLocation();

  // Define the course structure
  const courseStructure = {
    modules: [
      {
        id: 'module-1-ros2',
        title: 'Module 1: The Robotic Nervous System (ROS 2)',
        weeks: [
          { id: 'week1-2-intro', title: 'Week 1-2: Introduction to Physical AI' },
          { id: 'week3-5-ros2-fundamentals', title: 'Week 3-5: ROS 2 Fundamentals' }
        ]
      },
      {
        id: 'module-2-digital-twin',
        title: 'Module 2: Digital Twin & Simulation',
        weeks: [
          { id: 'week6-7-gazebo-unity', title: 'Week 6-7: Gazebo & Unity Digital Twins' }
        ]
      },
      {
        id: 'module-3-ai-robot-brain',
        title: 'Module 3: AI-Robot Brain',
        weeks: [
          { id: 'week8-10-nvidia-isaac', title: 'Week 8-10: NVIDIA Isaac for AI-Robot Brains' }
        ]
      },
      {
        id: 'module-4-vla',
        title: 'Module 4: Vision-Language-Action (VLA) Models',
        weeks: [
          { id: 'week11-12-humanoid-robot-dev', title: 'Week 11-12: Humanoid Robot Development' },
          { id: 'week13-conversational-robotics', title: 'Week 13: Conversational Robotics' }
        ]
      }
    ],
    hardwareRequirements: [
      { id: 'digital-twin-workstation', title: 'Digital Twin Workstation' },
      { id: 'physical-ai-edge-kit', title: 'Physical AI Edge Kit' },
      { id: 'robot-lab-options', title: 'Robot Lab Options' }
    ]
  };

  // Function to get current module and week based on URL
  const getCurrentPosition = () => {
    const path = location.pathname;

    for (const module of courseStructure.modules) {
      for (const week of module.weeks) {
        if (path.includes(`/${module.id}/${week.id}`)) {
          return { module, week };
        }
      }
    }

    // Check hardware requirements
    for (const hr of courseStructure.hardwareRequirements) {
      if (path.includes(`/hardware-requirements/${hr.id}`)) {
        return { hardwareRequirement: hr };
      }
    }

    if (path.includes('/intro')) {
      return { intro: true };
    }

    return null;
  };

  const currentPosition = getCurrentPosition();

  return (
    <div className="course-navigation-container">
      <div className="course-navigation">
        <h3>Course Navigation</h3>
        <ul className="course-modules-list">
          {courseStructure.modules.map((module, moduleIndex) => (
            <li key={module.id} className={`module-item ${currentPosition?.module?.id === module.id ? 'current-module' : ''}`}>
              <strong>{module.title}</strong>
              <ul className="module-weeks-list">
                {module.weeks.map((week) => {
                  const isCurrent = currentPosition?.week?.id === week.id;
                  return (
                    <li key={week.id} className={isCurrent ? 'current-week' : ''}>
                      <Link
                        to={`/docs/modules/${module.id}/${week.id}`}
                        className={isCurrent ? 'active-nav-link' : 'nav-link'}
                      >
                        {week.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <div className="hardware-requirements-section">
          <h4>Hardware Requirements</h4>
          <ul>
            {courseStructure.hardwareRequirements.map((hr) => {
              const isCurrent = currentPosition?.hardwareRequirement?.id === hr.id;
              return (
                <li key={hr.id}>
                  <Link
                    to={`/docs/hardware-requirements/${hr.id}`}
                    className={isCurrent ? 'active-nav-link' : 'nav-link'}
                  >
                    {hr.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseNavigation;