"use client"

import type React from "react"
import "./Switch.css"

interface SwitchProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function Switch({ id, checked, onChange }: SwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  return (
    <label className="switch" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={handleChange} className="switch-input" />
      <span className="switch-track">
        <span className="switch-thumb"></span>
      </span>
    </label>
  )
}

