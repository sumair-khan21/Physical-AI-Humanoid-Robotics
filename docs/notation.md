---
sidebar_position: 3
title: Mathematical Notation
description: Standard mathematical notation and conventions used throughout the textbook
keywords: [notation, mathematics, conventions, symbols, units]
---

# Mathematical Notation

This page defines the mathematical notation, symbols, and conventions used consistently throughout the textbook.

:::info Constitution Requirement
This notation guide ensures consistency across all chapters, as mandated by Constitution Principle III (Consistency & Standards).
:::

## General Conventions

**Scalars**: Lowercase italic (x, t, θ)
**Vectors**: Lowercase bold (**v**, **p**, **q**)
**Matrices**: Uppercase bold (**R**, **T**, **J**)
**Sets**: Uppercase calligraphic

## Robotics Notation

### Kinematics

- **q**: Joint positions vector (rad or m)
- **q̇**: Joint velocities vector (rad/s or m/s)
- **q̈**: Joint accelerations vector (rad/s² or m/s²)
- **p**: End-effector position (m)
- **R**: Rotation matrix 3×3
- **T**: Homogeneous transformation 4×4
- **J**: Jacobian matrix

### Dynamics

- τ: Joint torque (N⋅m)
- F: Force (N)
- m: Mass (kg)
- I: Moment of inertia (kg⋅m²)
- g: Gravitational acceleration (m/s², typically 9.81)

### Sensors

- ω: Angular velocity (rad/s)
- α: Angular acceleration (rad/s²)
- **a**: Linear acceleration (m/s²)
- d: Distance measurement (m)

## Angle Representations

### Euler Angles (ZYX Convention)

- φ (phi): Roll, rotation about X-axis, range [-π, π] rad
- θ (theta): Pitch, rotation about Y-axis, range [-π/2, π/2] rad
- ψ (psi): Yaw, rotation about Z-axis, range [-π, π] rad

### Quaternions

Representation: **q** = [qw, qx, qy, qz]

- qw: scalar part
- qx, qy, qz: vector part
- Constraint: qw² + qx² + qy² + qz² = 1

## Units (SI Preferred)

- **Length**: meter (m)
- **Mass**: kilogram (kg)
- **Time**: second (s)
- **Force**: Newton (N)
- **Torque**: Newton-meter (N⋅m)
- **Angle**: radian (rad)
- **Angular velocity**: rad/s
- **Frequency**: Hertz (Hz)

### Domain-Specific Exceptions

- Joint angles may be specified in degrees (noted explicitly, e.g., "45°")
- Motor speeds may use RPM (standard motor specification unit)

## Control Theory

- e(t): Error signal
- Kp: Proportional gain
- Ki: Integral gain
- Kd: Derivative gain
- G(s): Transfer function

## Example Usage

**Forward Kinematics**:
```
T(base→ee) = T₁(q₁) · T₂(q₂) · ... · Tₙ(qₙ)
```

**PID Control**:
```
τ(t) = Kp·e(t) + Ki·∫e(τ)dτ + Kd·de(t)/dt
```

**Jacobian Relationship**:
```
v = J(q) · q̇
```

---

:::tip Consistency
When you see these symbols in equations throughout the textbook, refer back to this page for their precise definitions and units.
:::
