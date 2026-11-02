'use server'

import { cookies } from 'next/headers'

export async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export async function login(password: string) {
  if (password !== process.env.ADMIN_PASSWORD) return false
  const cookieStore = await cookies()
  cookieStore.set('admin_session', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return true
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}