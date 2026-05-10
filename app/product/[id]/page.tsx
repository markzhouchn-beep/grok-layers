import { redirect } from 'next/navigation';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Redirect to shop - purchase is done via external links
  redirect('/shop');
}
