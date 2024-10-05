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
import { collection, deleteDoc, doc, getDoc } from "firebase/firestore";
import CameraComponent from "./components/camera.js";
import Popup from "./components/popup.js";
import { OpenAI } from "openai";

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState("none");
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [recipeStatus, setRecipeStatus] = useState(false);
  const [recipe, setRecipe] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    updatePantry();
  }, []);

  const updatePantry = async () => {
    const response = await fetch("/api/pantry-stock");
    const pantryList = await response.json();
    setPantry(pantryList);
  };

  const parseImage = async () => {
    const body = {
      image: image,
    };
    const response = await fetch("/api/scan-pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const parsedItems = await response.json();
    console.log(parsedItems);
    setImage(null)
  };

 
  const generateRecipe = async () => {
    const ingredientList = pantry.map((ingredient) => ingredient.name);
    const body = { ingredients: ingredientList };
    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const recipe = await response.json();
    setRecipeStatus(true);
    setRecipe(recipe);
  };

  const handleUpdate = async (item, quantity, condition) => {
    const body = { item: item, quantity: quantity, condition: condition };
    const response = await fetch("/api/pantry-stock/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await updatePantry();
  };

  const handleUpdateEditForm = async (e) => {
    e.preventDefault();
    const body = {
      item: itemName,
      quantity: itemQuantity,
      condition: "update",
    };
    const response = await fetch("/api/pantry-stock/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await updatePantry();
    setItemName("");
    setItemQuantity("");
    handleCloseEdit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const item = formData.get("itemName");
    const cleanedItem = item.toLowerCase().trim();
    const quantity = formData.get("quantity") || 1;
    const body = { item: cleanedItem, quantity: quantity };

    const response = await fetch("/api/pantry-stock/new", {
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

  const handleOpen = (modalType) => setOpen(modalType);
  const handleClose = () => setOpen("none");

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
      <Modal open={open == "add"} onClose={handleClose}>
        <Popup width={400}>
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
        </Popup>
      </Modal>
      <Modal
        open={open == "edit"}
        onClose={() => {
          handleClose();
          setItemName("");
          setItemQuantity("");
        }}
      >
        <Popup width={150} gap={2}>
          <form onSubmit={handleUpdateEditForm}>
            <TextField
              variant="outlined"
              label="Quantity"
              type="number"
              name="editQuantity"
              defaultValue={
                pantry.find((item) => item.name === itemName)?.quantity || ""
              }
              onChange={(e) =>
                setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
            <Button variant="outlined" type="submit">
              Save
            </Button>
          </form>
        </Popup>
      </Modal>
      <Modal
        open={open == "recipe"}
        onClose={() => {
          handleClose();
          setRecipeStatus(false);
          setRecipe("");
        }}
      >
        <Popup width={700} height="80%">
          <Typography variant="h5" color="text.primary" textAlign="center">
            Generated Recipe
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{
              maxHeight: "80%",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {recipeStatus ? (
              <p>
                {recipe["recipe"].split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            ) : (
              <span>Loading...</span>
            )}
          </Typography>
        </Popup>
      </Modal>
      <Modal
        open={open == "camera"}
        onClose={() => {
          handleClose();
        }}
      >
        <Popup width="50%" height="50%">
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            gap={3}
          >
            <CameraComponent
              setImage={setImage}
              onClick={parseImage}
              image={image}
            >
              Take Picture
            </CameraComponent>
          </Box>
        </Popup>
      </Modal>
      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={() => {
            handleOpen("recipe");
            generateRecipe();
          }}
        >
          Generate Recipe
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleOpen("add");
          }}
        >
          Add New Item
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            handleOpen("camera");
          }}
        >
          Camera
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
                    handleUpdate(name, 1, "add");
                  }}
                >
                  +
                </Button>
                <Button
                  sx={{ display: { xs: "none", sm: "block" } }}
                  variant="contained"
                  onClick={() => {
                    handleUpdate(name, 1, "subtract");
                  }}
                >
                  -
                </Button>
                <Button
                  variant="contained"
                  onClick={(e) => {
                    setItemName(name);
                    handleOpen("edit");
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
