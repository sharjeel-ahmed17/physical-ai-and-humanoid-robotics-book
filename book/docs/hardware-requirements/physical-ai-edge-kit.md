---
sidebar_label: 'Physical AI Edge Kit'
sidebar_position: 2
---

# Physical AI Edge Kit Requirements

## Overview

This guide outlines the components needed for a Physical AI Edge Kit, designed for implementing AI algorithms on edge devices with robotic applications.

## Essential Components

### Processing Unit
- **NVIDIA Jetson Orin AGX** (recommended) or Jetson Xavier NX
- 32GB LPDDR5 RAM (Orin) or 8GB LPDDR4x (Xavier)
- 64GB eMMC storage
- Cost: $600-800

### Sensors
- **RGB-D Camera**: Intel RealSense D435i
  - Depth sensing and color imaging
  - Cost: $200
- **IMU**: 9-axis inertial measurement unit
  - Accelerometer, gyroscope, magnetometer
  - Cost: $25
- **Lidar**: Slamtec RPLIDAR A1 or similar
  - 360° distance measurement
  - Cost: $150

### Communication
- **WiFi 6 Module**: For network connectivity
- **Bluetooth 5.0**: For peripheral connections
- **Ethernet**: For stable high-bandwidth connections

## Alternative Options

### Budget Option
- Raspberry Pi 4 (8GB) + Camera Module
- Cost: ~$150
- Limited processing power for complex AI models

### High-Performance Option
- NVIDIA Jetson Orin AGX 64GB
- Multiple high-end sensors
- Cost: ~$2,000

## Cost Breakdown

| Component | Cost |
|-----------|------|
| Jetson Orin AGX | $600 |
| RealSense D435i | $200 |
| IMU | $25 |
| Lidar | $150 |
| Power supply & cables | $50 |
| Enclosure | $75 |
| **Total** | **~$1,100** |

## Setup Instructions

1. Flash Jetson with JetPack SDK
2. Install ROS 2 Humble Hawksbill
3. Configure sensor drivers
4. Set up networking and communication
5. Test sensor integration

## Additional Considerations

- Power requirements: 12V/8A power supply recommended
- Heat dissipation: Consider active cooling for sustained operation
- Mounting: Design for integration with robotic platform