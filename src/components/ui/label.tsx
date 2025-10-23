
import React from 'react'
export function Label({ className='', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`text-sm text-neutral-300 ${className}`} {...props} />
}
