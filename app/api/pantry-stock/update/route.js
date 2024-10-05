import { firestore } from "@/firebase";
import { collection, getDoc, setDoc, doc, deleteDoc} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const docRef = doc(collection(firestore, "pantry"), body["item"]);
    const docSnap = await getDoc(docRef);
    switch (body["condition"]) {
      case "add":
        {
          const { quantity = 0 } = docSnap.exists() ? docSnap.data() : {};
          await setDoc(docRef, { quantity: quantity + 1 });
        }
        break;
      case "subtract":
        {
          const { quantity = 0 } = docSnap.exists() ? docSnap.data() : {};
          if (quantity == 1) {
            await deleteDoc(docRef);
          } else {
            await setDoc(docRef, { quantity: Math.max(quantity - 1, 0) });
          }
        }
        break;
      case "update":
        await setDoc(docRef, { quantity: body["quantity"] }, { merge: true });
        break;
    }
    return NextResponse.json(
      {
        message: "Item updated successfully",
        item: body["item"],
        quantity: body["quantity"],
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add item to pantry" },
      { status: 500 }
    );
  }
}
