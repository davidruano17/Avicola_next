import { redirect } from 'next/navigation';

// Replica el fallback del router original: <Route path="*" element={<Navigate to="/" replace />} />
export default function NotFound() {
  redirect('/');
}
