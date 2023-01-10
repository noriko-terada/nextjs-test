import '../styles/globals.css'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  console.log(`[App] reCAPTCHA SITE KEY(NEXT_PUBLIC)=${process.env.NEXT_PUBLIC_RECAPTCHA_KEY}`)
  console.log(`[App] VTECXNEXT_URL (NEXT_PUBLIC)=${process.env.NEXT_PUBLIC_VTECXNEXT_URL}`)
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY!} language="ja">
      <Component {...pageProps} />
    </GoogleReCaptchaProvider>
  );
}
