import { NextResponse } from 'next/server'

export async function GET() {
  const memory = {
    language: 'English',
    profession: 'Product Designer',
    project: 'Narender AI — Vault'
  }
  return NextResponse.json({ memory })
}
