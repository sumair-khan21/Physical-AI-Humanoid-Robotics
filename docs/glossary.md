---
sidebar_position: 2
title: Glossary
description: Technical terminology and definitions for Physical AI & Humanoid Robotics
keywords: [glossary, terminology, robotics terms, ROS 2 definitions]
---

# Glossary

This glossary provides definitions for key technical terms used throughout the textbook. Terms are organized alphabetically for easy reference.

:::info Constitution Requirement
This glossary serves as the single source of truth for terminology consistency across all 16 chapters, as mandated by Constitution Principle III (Consistency & Standards).
:::

## A

**Action** (ROS 2)
: A communication pattern in ROS 2 for long-running tasks that provide feedback and can be preempted. Used for tasks like navigation, manipulation, or complex behaviors.

**Actuator**
: A component that converts energy into motion, such as motors or servos that move robot joints.

**APA Citation**
: American Psychological Association citation format used for all references in this textbook to official documentation.

## C

**Costmap**
: A grid-based representation of the environment used for navigation, showing obstacles and free space. Can be static (from a map) or dynamic (from sensors).

## D

**DDS (Data Distribution Service)**
: The middleware used by ROS 2 for publish-subscribe communication, providing real-time data exchange.

**Digital Twin**
: A virtual replica of a physical robot used for testing, validation, and development in simulation before deployment to hardware.

**Domain Randomization**
: A technique for improving sim-to-real transfer by varying simulation parameters (lighting, textures, friction) to train robust policies.

## G

**Gazebo**
: An open-source 3D robotics simulator with physics engines, sensor simulation, and ROS 2 integration.

## I

**Isaac Sim**
: NVIDIA's GPU-accelerated robotics simulator built on Omniverse, featuring PhysX 5 physics and RTX ray tracing.

**IMU (Inertial Measurement Unit)**
: A sensor that measures acceleration and angular velocity, used for robot orientation and motion tracking.

## J

**Joint**
: A connection between robot links that allows motion. Common types: revolute (rotational), prismatic (linear), and fixed.

## L

**LiDAR (Light Detection and Ranging)**
: A sensor that uses laser pulses to measure distances and create 3D point clouds of the environment.

**LLM (Large Language Model)**
: An AI model trained on text data, used in robotics for high-level task planning and natural language understanding.

## M

**MDX**
: Markdown with JSX support, allowing React components to be embedded in Markdown files. Used for interactive content in this textbook.

**Mermaid.js**
: A text-based diagramming tool used to create flowcharts and architecture diagrams in this textbook.

## N

**Nav2**
: The navigation stack for ROS 2, providing global planning, local planning, costmaps, and behavior trees for robot navigation.

**Node** (ROS 2)
: An independent process that performs a specific task (e.g., sensor reading, motor control, planning). Nodes communicate via topics, services, and actions.

## P

**PhysX**
: NVIDIA's physics engine used in Isaac Sim for realistic simulation of rigid body dynamics, collisions, and contacts.

**Prism**
: A syntax highlighting library used in Docusaurus to display code examples with proper formatting.

## Q

**QoS (Quality of Service)**
: Policies in ROS 2 that control message delivery reliability, durability, and history for robust communication.

## R

**ROS 2 (Robot Operating System 2)**
: An open-source framework for robotics development, providing tools for communication, device drivers, libraries, and visualization.

**ROS 2 Humble**
: A Long-Term Support (LTS) release of ROS 2 for Ubuntu 22.04, supported until 2027.

**RTX Ray Tracing**
: NVIDIA's real-time ray tracing technology used in Isaac Sim for photorealistic rendering.

## S

**SDF (Simulation Description Format)**
: An XML format for describing robot models, sensors, and environments in Gazebo simulation.

**Service** (ROS 2)
: A synchronous request-response communication pattern in ROS 2, used for one-off queries or commands.

**Sim-to-Real Transfer**
: The process of deploying policies, controllers, or behaviors trained in simulation to real-world hardware.

## T

**Topic** (ROS 2)
: An asynchronous, many-to-many communication channel in ROS 2 for streaming data (e.g., sensor readings, state updates).

## U

**Ubuntu 22.04**
: The Long-Term Support (LTS) Linux distribution used as the primary platform for this textbook.

**URDF (Unified Robot Description Format)**
: An XML format for describing robot kinematics, geometry, and dynamics in ROS 2.

## V

**VLA (Vision-Language-Action)**
: An AI approach that integrates visual perception, natural language understanding, and robot action execution.

**VSLAM (Visual Simultaneous Localization and Mapping)**
: A technique for building maps and localizing robots using only camera images, without external markers.

## W

**Workspace** (ROS 2)
: A directory containing ROS 2 packages, organized into `src/`, `build/`, `install/`, and `log/` subdirectories.

---

## Adding New Terms

When you encounter unfamiliar terminology in the chapters, refer back to this glossary. Terms are introduced when first used and linked to this glossary for quick reference.

:::tip
Use your browser's search function (Ctrl+F or Cmd+F) to quickly find specific terms in this glossary.
:::
