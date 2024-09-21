import { firestore } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = docs.docs.map(doc => ({
      name: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(pantryList);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pantry' }, { status: 500 });
  }
}
