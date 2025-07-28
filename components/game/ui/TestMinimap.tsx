"use client"

import React from 'react'

const TestMinimap: React.FC = () => {
  console.log('TestMinimap: Component is rendering!')
  
  return (
    <div 
      className="fixed bottom-4 left-4 z-50 bg-red-500 text-white p-4 rounded-lg border-2 border-white"
      style={{
        width: '200px',
        height: '200px',
        backgroundColor: 'red',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <div>TEST MINIMAP</div>
      <div>I AM VISIBLE!</div>
      <div style={{ fontSize: '12px', marginTop: '10px' }}>
        If you can see this, the HUD is working
      </div>
    </div>
  )
}

export default TestMinimap
