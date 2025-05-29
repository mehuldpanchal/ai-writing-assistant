import '../styles/globals.css'
import BottomNav from '../components/ui/BottomNav'

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 w-full">
        <Component {...pageProps} />
      </main>
      <BottomNav />
    </div>
  )
}