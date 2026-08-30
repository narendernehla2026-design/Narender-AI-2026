import './globals.css'

export const metadata = {
  title: 'AI Control Workshop',
  description: 'AI Control Workshop — clean PWA for mobile automation & offline mode',
  generator: 'Next.js 14+',
  applicationName: 'AI Control Workshop',
  author: 'Narender AI',
  keywords: 'AI, Workshop, Control, PWA, Gemini, Chat',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover',
  themeColor: '#ffffff',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg'
  }
}

export default function RootLayout({ children }) {
  const registerSW = `
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((e) => {
        console.log('SW registration failed:', e);
      });
    }
  `

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Workshop" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="icon" href="/icons/icon-192.svg" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.svg" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: registerSW }} />
        {children}
      </body>
    </html>
  )
}
