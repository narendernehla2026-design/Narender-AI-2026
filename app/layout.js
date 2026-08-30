import './globals.css'
import Head from 'next/head'

export const metadata = {
  title: 'AI Control Workshop',
  description: 'AI Control Workshop — clean PWA for mobile automation & offline mode'
}

export default function RootLayout({ children }) {
  const registerSW = `
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  `

  return (
    <html lang="en">
      <Head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/icons/icon-192.svg" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: registerSW }} />
        {children}
      </body>
    </html>
  )
}
