"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
} from "firebase/firestore";

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editItemQuantity, setEditItemQuantity] = useState(1);
  const [editItemName, setEditItemName] = useState("");

  useEffect(() => {
    updatePantry();
  }, []);

  const updatePantry = async () => {
    const response = await fetch("/api/pantry-stock");
    const pantryList = await response.json();
    setPantry(pantryList);
  };

  const generateRecipe = async (items) => {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            {
              role: "user",
              content: `Generate a recipe with these items: ${items}`,
            },
          ],
        }),
      }
    );
    const data = await response.json();
    console.log(data.choices[0].message.content);
  };

  const editItem = async (item, newQuantity) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await setDoc(docRef, { quantity: newQuantity }, { merge: true });
    }
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity == 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };

  const handleUpdate = async (item, quantity, condition) => {
    const body = { item: item, quantity: quantity , condition: condition};
    const response = fetch("/api/pantry-stock/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await updatePantry();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const item = formData.get("itemName");
    const cleanedItem = item.toLowerCase().trim();
    const quantity = formData.get("quantity");
    const body = { item: cleanedItem, quantity: quantity };

    const response = fetch("/api/pantry-stock/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    await updatePantry();
    setItemName("");
    setItemQuantity("");
    handleClose();
  };

  const clearItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await deleteDoc(docRef);
    }
    await updatePantry();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #0000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <form onSubmit={handleSubmit}>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                label="Item"
                name="itemName"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
              />
              <TextField
                variant="outlined"
                label="Quantity"
                type="number"
                name="quantity"
                value={itemQuantity}
                onChange={(e) =>
                  setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
              <Button variant="outlined" type="submit">
                Add
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={150}
          bgcolor="white"
          border="2px solid #0000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <TextField
            variant="outlined"
            label="Quantity"
            type="number"
            defaultValue={
              pantry.find((item) => item.name === editItemName)?.quantity || ""
            }
            onChange={(e) =>
              setEditItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
          />
          <Button
            variant="outlined"
            onClick={() => {
              editItem(editItemName, editItemQuantity);
              setEditItemName("");
              setEditItemQuantity(1);
              handleCloseEdit();
            }}
          >
            Save
          </Button>
        </Box>
      </Modal>
      <Box>
        <Button variant="contained" onClick={() => generateRecipe("tomato")}>
          Generate Recipe
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleOpen();
          }}
        >
          Add New Item
        </Button>
      </Box>
      <Box border="1px solid #333" sx={{ width: { xs: "90vw", md: "60vw" } }}>
        <Box
          height="10vh"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h2"
            color="#333"
            sx={{
              fontSize: {
                xs: "2rem",
              },
            }}
          >
            Pantry Items
          </Typography>
        </Box>
        <Stack height="60vh" spacing={2} overflow="auto">
          {pantry.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="grid"
              sx={{
                gridTemplateColumns: { xs: "1fr .7fr .5fr", md: "1fr 1fr 1fr" },
              }}
              alignItems="center"
              bgcolor="#f0f0f0"
              padding={2}
            >
              <Typography
                variant="h3"
                color="#333"
                sx={{
                  maxWidth: "400px",
                  overflow: "auto",
                  textOverflow: "clip",
                  whiteSpace: "nowrap",
                  fontSize: {
                    xs: "1.5rem",
                  },
                }}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              <Typography
                variant="h3"
                color="#333"
                textAlign="center"
                sx={{
                  fontSize: {
                    xs: "2rem",
                  },
                }}
              >
                {quantity}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { sm: "1fr 1fr", md: "repeat(4, 1fr)" },
                  gap: 1,
                }}
              >
                <Button
                  sx={{ display: { xs: "none", sm: "block" } }}
                  variant="contained"
                  onClick={() => {
                    handleUpdate(name, 1, "add")
                  }}
                >
                  +
                </Button>
                <Button
                  sx={{ display: { xs: "none", sm: "block" } }}
                  variant="contained"
                  onClick={() => {
                    handleUpdate(name, 1, "subtract")
                  }}
                >
                  -
                </Button>
                <Button
                  variant="contained"
                  onClick={(e) => {
                    setEditItemName(name);
                    handleOpenEdit();
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    clearItem(name);
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
