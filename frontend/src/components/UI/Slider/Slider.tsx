"use client"

import type React from "react"

import { useState, useEffect } from "react"
import "./Slider.css"

interface SliderProps {
  id: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

export default function Slider({ id, min, max, step, value, onChange }: SliderProps) {
  const [position, setPosition] = useState(0)

  useEffect(() => {
    const percentage = ((value - min) / (max - min)) * 100
    setPosition(percentage)
  }, [value, min, max])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    onChange(newValue)
  }

  return (
    <div className="slider-wrapper">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="slider-input"
      />
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${position}%` }}></div>
        <div className="slider-thumb" style={{ left: `${position}%` }}></div>
      </div>
    </div>
  )
}

