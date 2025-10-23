
import React from 'react'
type Props = { value: number[], min?: number, max?: number, step?: number, onValueChange?: (v:number[])=>void, className?: string }
export function Slider({ value, min=0, max=10, step=1, onValueChange, className='' }: Props) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e)=> onValueChange?.([Number(e.target.value)])}
      className={`w-full ${className}`}
    />
  )
}
