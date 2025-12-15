# Data Model: Docusaurus Book Creation

## Course
- **name**: Physical AI & Humanoid Robotics
- **description**: A capstone quarter introducing Physical AI—AI systems that function in reality and comprehend physical laws
- **duration**: 13 weeks
- **learning_outcomes**: List of educational objectives
- **modules**: Array of Module entities

## Module
- **id**: Unique identifier (e.g., "module-1-ros2")
- **title**: Display name (e.g., "The Robotic Nervous System (ROS 2)")
- **description**: Brief explanation of module focus
- **weeks**: Array of Week entities
- **order**: Numeric position in course sequence (1-4)

## Week
- **number**: Week number in course sequence (1-13)
- **title**: Week topic
- **content**: Textbook content for the week
- **objectives**: Learning objectives for the week
- **module_id**: Reference to parent Module

## Chapter
- **id**: Unique identifier
- **title**: Chapter title
- **content**: Main content in Markdown format
- **module_id**: Reference to parent Module
- **week_number**: Associated week number
- **order**: Position within module/week
- **prerequisites**: List of required prior knowledge

## HardwareGuide
- **id**: Unique identifier
- **title**: Guide title (e.g., "Digital Twin Workstation")
- **category**: Type of hardware (workstation, edge_kit, robot_lab)
- **components**: Array of Component entities
- **cost_breakdown**: Estimated costs for components
- **setup_instructions**: Step-by-step setup guide

## Component
- **name**: Component name
- **model**: Specific model/variant
- **price**: Approximate cost
- **description**: Purpose and specifications
- **alternatives**: Alternative options