"use client"

import { Text } from "@react-three/drei"
import { useVehicle } from "@/lib/vehicle-context"
import Car from "./car"
import Motorcycle from "./motorcycle"
import Bicycle from "./bicycle"

export default function VehicleManager() {
  const { vehicleState, setActiveVehicle, exitVehicle } = useVehicle()
  const activeVehicle = vehicleState.activeVehicle

  const handleCarClick = () => {
    if (activeVehicle === 'car') {
      exitVehicle()
    } else {
      setActiveVehicle('car')
    }
  }

  const handleMotorcycleClick = () => {
    if (activeVehicle === 'motorcycle') {
      exitVehicle()
    } else {
      setActiveVehicle('motorcycle')
    }
  }

  const handleBicycleClick = () => {
    if (activeVehicle === 'bicycle') {
      exitVehicle()
    } else {
      setActiveVehicle('bicycle')
    }
  }

  return (
    <group>
      {/* Vehicle Status Display */}
      {activeVehicle && (
        <group position={[0, 3, 8]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.3}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
          >
            {activeVehicle === 'car' && 'Driving Car - WASD to control'}
            {activeVehicle === 'motorcycle' && 'Riding Motorcycle - WASD to control'}
            {activeVehicle === 'bicycle' && 'Riding Bicycle - WASD to control'}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.2}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
          >
            Click vehicle again to stop driving
          </Text>
        </group>
      )}

      {/* Vehicles with Selection Indicators */}
      <group>
        {/* Car with selection indicator */}
        <group position={[-3.5, 0, 9]}>
          <Car 
            position={[0, 0, 0]} 
            rotation={[0, -Math.PI / 8, 0]} 
            active={activeVehicle === 'car'}
            onClick={handleCarClick}
          />
          {activeVehicle === 'car' && (
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial 
                color="#00ff00" 
                emissive="#00ff00" 
                emissiveIntensity={0.5}
                transparent 
                opacity={0.7}
              />
            </mesh>
          )}
        </group>

        {/* Motorcycle with selection indicator */}
        <group position={[0, 0, 10]}>
          <Motorcycle 
            position={[0, 0, 0]} 
            rotation={[0, 0, 0]} 
            active={activeVehicle === 'motorcycle'}
            onClick={handleMotorcycleClick}
          />
          {activeVehicle === 'motorcycle' && (
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial 
                color="#00ff00" 
                emissive="#00ff00" 
                emissiveIntensity={0.5}
                transparent 
                opacity={0.7}
              />
            </mesh>
          )}
        </group>

        {/* Bicycle with selection indicator */}
        <group position={[3.2, 0, 9.5]}>
          <Bicycle 
            position={[0, 0, 0]} 
            rotation={[0, Math.PI / 6, 0]} 
            active={activeVehicle === 'bicycle'}
            onClick={handleBicycleClick}
          />
          {activeVehicle === 'bicycle' && (
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial 
                color="#00ff00" 
                emissive="#00ff00" 
                emissiveIntensity={0.5}
                transparent 
                opacity={0.7}
              />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )
}
