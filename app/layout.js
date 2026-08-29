import './globals.css'
import Head from 'next/head'

export const metadata = {
  title: 'Narender AI Vault',
  description: 'Secure PWA for AI assistance — voice, screen preview, and memory'
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
        <meta name="theme-color" content="#071129" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: registerSW }} />
        {children}
      </body>
    </html>
  )
}
