
import React from 'react'
export function Card({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 ${className}`} {...props} />
}
export function CardContent({ className='', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 sm:p-6 ${className}`} {...props} />
}
