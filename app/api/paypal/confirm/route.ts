// /api/paypal/confirm.ts
import { updateDoc, doc} from 'firebase/firestore';
import {db}  from '@/lib/firebase';

export async function POST(req: Request) {
  const { user_id, credits } = await req.json();
  const userRef = doc(db, "users", user_id);
  await updateDoc(userRef, { credits: credits }); // atau +=
  return new Response("OK", { status: 200 });
}
