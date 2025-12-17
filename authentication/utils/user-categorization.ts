// User categorization algorithm based on background profiling data
import { UserBackgroundData, UserSkillLevel } from '../types/auth-types';

// Define expertise levels for different technologies
const TECHNOLOGY_EXPERTISE: { [key: string]: UserSkillLevel } = {
  // Programming languages
  'javascript': 'intermediate',
  'python': 'intermediate',
  'java': 'intermediate',
  'c++': 'advanced',
  'c#': 'intermediate',
  'go': 'advanced',
  'rust': 'advanced',
  'typescript': 'intermediate',
  'react': 'intermediate',
  'vue': 'intermediate',
  'angular': 'intermediate',
  'node.js': 'intermediate',
  'django': 'intermediate',
  'flask': 'intermediate',
  'spring': 'advanced',
  'express': 'intermediate',
  // Robotics platforms
  'ros': 'advanced',
  'ros2': 'advanced',
  'arduino': 'beginner',
  'raspberry pi': 'intermediate',
  'raspberrypi': 'intermediate',
  'ardrone': 'intermediate',
  'turtlebot': 'intermediate',
  'pr2': 'advanced',
  // Hardware
  'fpga': 'advanced',
  'asic': 'advanced',
  'microcontroller': 'beginner',
  'sensor': 'intermediate',
  'actuator': 'intermediate',
  'motor control': 'intermediate',
};

// Define experience thresholds
const EXPERIENCE_THRESHOLDS = {
  beginner: { years: 1, technologies: 1 },
  intermediate: { years: 3, technologies: 3 },
  advanced: { years: 5, technologies: 5 },
};

// Calculate a user's skill level based on their background data
export function categorizeUser(backgroundData: UserBackgroundData): UserSkillLevel {
  const {
    software_experience = [],
    hardware_familiarity = [],
    years_coding = 0,
    years_hardware = 0,
    primary_languages = [],
    robotics_experience = 'none',
  } = backgroundData;

  // Calculate a composite score based on various factors
  let score = 0;

  // Years of experience contribute to the score
  score += years_coding * 2; // Coding experience is weighted more heavily
  score += years_hardware * 1.5; // Hardware experience is also valuable

  // Number of technologies known contributes to the score
  score += software_experience.length;
  score += hardware_familiarity.length;

  // Primary languages add to the score
  score += primary_languages.length;

  // Robotics experience adds to the score
  switch (robotics_experience) {
    case 'basic':
      score += 1;
      break;
    case 'intermediate':
      score += 3;
      break;
    case 'advanced':
      score += 5;
      break;
    case 'none':
    default:
      score += 0;
  }

  // Check for advanced technologies in the user's background
  const advancedTechnologies = [
    'ros', 'ros2', 'fpga', 'asic', 'c++', 'rust', 'go', 'spring', 'pr2'
  ];

  for (const tech of software_experience) {
    if (advancedTechnologies.includes(tech.toLowerCase())) {
      score += 2; // Bonus for advanced technologies
    }
  }

  for (const tech of hardware_familiarity) {
    if (advancedTechnologies.includes(tech.toLowerCase())) {
      score += 2; // Bonus for advanced technologies
    }
  }

  // Determine skill level based on score thresholds
  if (score >= 15) return 'advanced';
  if (score >= 7) return 'intermediate';
  return 'beginner';
}

// Calculate skill level with more granular assessment
export function calculateDetailedSkillLevel(backgroundData: UserBackgroundData): {
  level: UserSkillLevel;
  score: number;
  factors: string[];
} {
  const {
    software_experience = [],
    hardware_familiarity = [],
    years_coding = 0,
    years_hardware = 0,
    primary_languages = [],
    robotics_experience = 'none',
    development_area = '',
    preferred_platforms = [],
  } = backgroundData;

  let score = 0;
  const factors: string[] = [];

  // Years of experience
  if (years_coding >= EXPERIENCE_THRESHOLDS.advanced.years) {
    score += 5;
    factors.push(`Years coding: ${years_coding} (advanced level)`);
  } else if (years_coding >= EXPERIENCE_THRESHOLDS.intermediate.years) {
    score += 3;
    factors.push(`Years coding: ${years_coding} (intermediate level)`);
  } else if (years_coding >= EXPERIENCE_THRESHOLDS.beginner.years) {
    score += 1;
    factors.push(`Years coding: ${years_coding} (beginner level)`);
  }

  if (years_hardware >= EXPERIENCE_THRESHOLDS.advanced.years) {
    score += 4;
    factors.push(`Years hardware: ${years_hardware} (advanced level)`);
  } else if (years_hardware >= EXPERIENCE_THRESHOLDS.intermediate.years) {
    score += 2;
    factors.push(`Years hardware: ${years_hardware} (intermediate level)`);
  } else if (years_hardware >= EXPERIENCE_THRESHOLDS.beginner.years) {
    score += 1;
    factors.push(`Years hardware: ${years_hardware} (beginner level)`);
  }

  // Number of technologies
  if (software_experience.length >= EXPERIENCE_THRESHOLDS.advanced.technologies * 2) {
    score += 4;
    factors.push(`Software experience: ${software_experience.length} technologies (advanced level)`);
  } else if (software_experience.length >= EXPERIENCE_THRESHOLDS.intermediate.technologies) {
    score += 2;
    factors.push(`Software experience: ${software_experience.length} technologies (intermediate level)`);
  } else if (software_experience.length >= EXPERIENCE_THRESHOLDS.beginner.technologies) {
    score += 1;
    factors.push(`Software experience: ${software_experience.length} technologies (beginner level)`);
  }

  if (hardware_familiarity.length >= EXPERIENCE_THRESHOLDS.advanced.technologies) {
    score += 3;
    factors.push(`Hardware familiarity: ${hardware_familiarity.length} technologies (advanced level)`);
  } else if (hardware_familiarity.length >= EXPERIENCE_THRESHOLDS.intermediate.technologies) {
    score += 1.5;
    factors.push(`Hardware familiarity: ${hardware_familiarity.length} technologies (intermediate level)`);
  }

  // Primary languages
  if (primary_languages.length >= 3) {
    score += 2;
    factors.push(`Primary languages: ${primary_languages.length} languages (advanced level)`);
  } else if (primary_languages.length >= 2) {
    score += 1;
    factors.push(`Primary languages: ${primary_languages.length} languages (intermediate level)`);
  }

  // Development area
  if (development_area.toLowerCase().includes('full-stack') || development_area.toLowerCase().includes('backend')) {
    score += 1;
    factors.push(`Development area: ${development_area} (adds to score)`);
  }

  // Preferred platforms
  if (preferred_platforms.length >= 2) {
    score += 1;
    factors.push(`Preferred platforms: ${preferred_platforms.length} platforms (shows engagement)`);
  }

  // Robotics experience
  switch (robotics_experience) {
    case 'advanced':
      score += 4;
      factors.push(`Robotics experience: ${robotics_experience} level`);
      break;
    case 'intermediate':
      score += 2;
      factors.push(`Robotics experience: ${robotics_experience} level`);
      break;
    case 'basic':
      score += 1;
      factors.push(`Robotics experience: ${robotics_experience} level`);
      break;
    case 'none':
      factors.push(`Robotics experience: ${robotics_experience} level`);
      break;
  }

  // Apply expertise multipliers based on specific technologies
  for (const tech of [...software_experience, ...hardware_familiarity]) {
    const lowerTech = tech.toLowerCase();
    if (TECHNOLOGY_EXPERTISE[lowerTech]) {
      const expertise = TECHNOLOGY_EXPERTISE[lowerTech];
      let multiplier = 1;

      switch (expertise) {
        case 'advanced':
          multiplier = 1.5;
          break;
        case 'intermediate':
          multiplier = 1.2;
          break;
        case 'beginner':
          multiplier = 1.0;
          break;
      }

      score *= multiplier;
      factors.push(`Technology expertise: ${tech} (${expertise} level)`);
    }
  }

  // Determine skill level based on the calculated score
  let level: UserSkillLevel;
  if (score >= 20) {
    level = 'advanced';
  } else if (score >= 10) {
    level = 'intermediate';
  } else {
    level = 'beginner';
  }

  return {
    level,
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    factors,
  };
}

// Get recommended learning path based on skill level and background
export function getLearningPath(backgroundData: UserBackgroundData): string {
  const skillLevel = categorizeUser(backgroundData);

  // Based on skill level and background, return an appropriate learning path
  switch (skillLevel) {
    case 'beginner':
      return 'Start with fundamental programming concepts, basic robotics, and essential tools';
    case 'intermediate':
      return 'Focus on advanced programming patterns, robotics frameworks, and specialized tools';
    case 'advanced':
      return 'Explore cutting-edge research, complex system design, and specialized applications';
  }
}

// Get recommended interests based on background
export function getRecommendedInterests(backgroundData: UserBackgroundData): string[] {
  const interests: string[] = [];
  const { software_experience = [], hardware_familiarity = [], development_area = '' } = backgroundData;

  // Add interests based on software experience
  for (const tech of software_experience) {
    if (tech.toLowerCase().includes('ai') || tech.toLowerCase().includes('ml')) {
      interests.push('Artificial Intelligence', 'Machine Learning');
    } else if (tech.toLowerCase().includes('web')) {
      interests.push('Web Development', 'Frontend/Backend Technologies');
    } else if (tech.toLowerCase().includes('mobile')) {
      interests.push('Mobile Development', 'Cross-platform Frameworks');
    }
  }

  // Add interests based on hardware familiarity
  for (const tech of hardware_familiarity) {
    if (tech.toLowerCase().includes('robot')) {
      interests.push('Robotics', 'Autonomous Systems');
    } else if (tech.toLowerCase().includes('sensor')) {
      interests.push('Sensor Integration', 'IoT');
    } else if (tech.toLowerCase().includes('microcontroller')) {
      interests.push('Embedded Systems', 'Hardware Programming');
    }
  }

  // Add interest based on development area
  if (development_area.toLowerCase().includes('ai')) {
    interests.push('AI/ML Applications', 'Data Science');
  } else if (development_area.toLowerCase().includes('web')) {
    interests.push('Web Technologies', 'Full-stack Development');
  }

  // Add default interests if none were derived
  if (interests.length === 0) {
    interests.push('Programming Fundamentals', 'Software Development', 'Technology Trends');
  }

  // Remove duplicates
  return [...new Set(interests)];
}