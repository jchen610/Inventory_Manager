import { firestore } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { NextResponse } from 'next/server';

export async function POST(request){
    try {
        console.log(request.json())
      } catch (error) {
        return NextResponse.json({ error: 'Failed to add item to pantry' }, { status: 500 });
      }
}


const addItem = async (item) => {
    const cleanedItem = item.toLowerCase().trim();
    const docRef = doc(collection(firestore, "pantry"), cleanedItem);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + itemQuantity });
    } else {
      await setDoc(docRef, { quantity: itemQuantity });
    }
    await updatePantry();
  };
