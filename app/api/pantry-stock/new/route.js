import { firestore } from "@/firebase";
import { collection, setDoc, doc} from "firebase/firestore";
import { NextResponse } from 'next/server';

export async function POST(request){
    try {
        const body = await request.json()
        const docRef = doc(collection(firestore, "pantry"), body["item"]);
        await setDoc(docRef, { quantity: body["quantity"] })
        return NextResponse.json(
            { message: 'Item added successfully', item: body["item"], quantity: body["quantity"] },
            { status: 201 }
        )
      } catch (error) {
        return NextResponse.json({ error: 'Failed to add item to pantry' }, { status: 500 });
      }
}
