import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#2c203c',
}

export const metadata = {
  title: 'Narender AI — Private workspace',
  description: 'A private AI workspace for conversations, personal context, and saved memories.',
  applicationName: 'Narender AI',
  generator: 'Next.js',
  keywords: ['AI assistant', 'private workspace', 'personal knowledge', 'Narender AI'],
  manifest: '/manifest.json',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Narender AI — Private workspace',
    description: 'A private AI workspace for conversations and saved memories.',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Narender AI',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-192.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
