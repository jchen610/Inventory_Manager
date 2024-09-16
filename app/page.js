'use client'
import Image from "next/image";
import {useState, useEffect} from 'react'
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [editItemQuantity, setEditItemQuantity] = useState(1);
  const [editItemName, setEditItemName] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const editItem = async (item, newQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await setDoc(docRef, { quantity: newQuantity }, { merge: true });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory' ), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity == 1){
        await deleteDoc(docRef)
      }
      else{
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  const addItem = async (item) => {
    const cleanedItem = item.toLowerCase().trim()
    const docRef = doc(collection(firestore, 'inventory'), cleanedItem)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + itemQuantity })
    } else {
      await setDoc(docRef, { quantity: itemQuantity })
    }
    await updateInventory()
  }

  const clearItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory' ), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      await deleteDoc(docRef)
    }
    await updateInventory()
  }
  
  useEffect(() => {
    updateInventory()
  } , [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleOpenEdit = () => setOpenEdit(true)
  const handleCloseEdit = () => setOpenEdit(false)

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
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              label="Item"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
            <TextField
              variant="outlined"
              label="Quantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                setItemQuantity(1)
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
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
            transform: "translate(-50%, -50%)"
          }}
        >
          <TextField
            variant="outlined"
            label="Quantity"
            type="number"
            value={editItemQuantity}
            onChange={(e) => setEditItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <Button
            variant="outlined"
            onClick={() => {
              editItem(editItemName, editItemQuantity)
              setEditItemName('')
              setEditItemQuantity(1)
              handleCloseEdit()
            }}
          >
            Save
          </Button>
        </Box>
      </Modal>
      <Button
        variant="contained"
        onClick={() => {handleOpen()}}
      >
        Add New Item
      </Button>
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={5}
            >
              <Typography variant="h3" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={(e) => {
                    setEditItemName(name)
                    handleOpenEdit()
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(name)
                  }}
                >
                  +
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(name)
                  }}
                >
                  -
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    clearItem(name)
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}