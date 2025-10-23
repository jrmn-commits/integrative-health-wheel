
import React from 'react'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'secondary'|'outline'|'destructive', size?: 'sm'|'md' }
export function Button({ className='', variant='default', size='md', ...props }: Props) {
  const variants: Record<string,string> = {
    default: 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700',
    secondary: 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800',
    outline: 'bg-transparent hover:bg-neutral-900 border border-neutral-700',
    destructive: 'bg-red-600 hover:bg-red-500 border border-red-700'
  }
  const sizes: Record<string,string> = { sm:'px-3 py-1.5 text-sm rounded-md', md:'px-4 py-2 rounded-lg' }
  return <button className={`${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
