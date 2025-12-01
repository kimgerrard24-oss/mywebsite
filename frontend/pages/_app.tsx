// files frontend/pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '../sentry.client.config';
import '../sentry.server.config';


import { useEffect, useRef } from 'react';
import { getFirebaseAuth } from '@/lib/firebaseClient';


function exposeFirebaseAuthSafeOnce() {
if (typeof window === 'undefined') return;


const enabled =
localStorage.getItem('__debug_firebase') === '1' ||
window.location.search.includes('debug-firebase=1');


if (!enabled) return;


try {
const auth = getFirebaseAuth();
if (!auth) {
console.warn('[DEBUG] getFirebaseAuth() returned null/undefined');
return;
}


(window as any)._firebaseAuth = auth;
console.log('[DEBUG] Firebase Auth exposed at window._firebaseAuth');
} catch (err) {
console.error('[DEBUG] Failed to expose FirebaseAuth:', err);
}
}


export default function App({ Component, pageProps }: AppProps) {
const didExpose = useRef(false);


useEffect(() => {
if (didExpose.current) return;
didExpose.current = true;


exposeFirebaseAuthSafeOnce();
}, []);


return <Component {...pageProps} />;
}