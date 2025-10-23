
import React from 'react'
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className='', ...rest } = props
  return <input className={`bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-neutral-700 ${className}`} {...rest} />
}
