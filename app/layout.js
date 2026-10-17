import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import InstallAppPrompt from '@/components/InstallAppPrompt'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#101229',
}

export const metadata = {
  title: 'Smart AI — Your private companion',
  description: 'A private AI companion for conversations, voice commands, and saved context.',
  applicationName: 'Smart AI',
  generator: 'Next.js',
  keywords: ['Smart AI', 'AI assistant', 'private companion', 'personal knowledge'],
  manifest: '/manifest.json',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Smart AI — Your private companion',
    description: 'A private AI companion for conversations, voice commands, and saved context.',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Smart AI',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/smart-ai.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        <InstallAppPrompt />
        {children}
      </body>
    </html>
  )
}
