/**
 * @swagger
 * /api/sellerOrder/inventoryManagement:
 *   get:
 *     summary: Get all inventory items
 *     tags:
 *       - Inventory
 *     responses:
 *       200:
 *         description: A list of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryItem'
 *       500:
 *         description: Failed to fetch inventory
 *
 *   put:
 *     summary: Update inventory quantity for a specific size
 *     tags:
 *       - Inventory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInventoryInput'
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Item not found
 *       500:
 *         description: Failed to update inventory
 *
 *   post:
 *     summary: Update inventory (same as PUT)
 *     tags:
 *       - Inventory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInventoryInput'
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Item not found
 *       500:
 *         description: Failed to update inventory
 *
 * components:
 *   schemas:
 *     InventoryItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         productName:
 *           type: string
 *         inventory:
 *           type: object
 *           properties:
 *             S:
 *               type: number
 *             M:
 *               type: number
 *             L:
 *               type: number
 *             XL:
 *               type: number
 *
 *     UpdateInventoryInput:
 *       type: object
 *       required:
 *         - id
 *         - size
 *         - quantityChange
 *       properties:
 *         id:
 *           type: string
 *         size:
 *           type: string
 *           enum: [S, M, L, XL]
 *         quantityChange:
 *           type: number
 */





import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDB } from '@/lib/db'
import { Inventory } from '@/lib/models/inventory'

const uri = process.env.MONGODB_URI || ''
if (!mongoose.connection.readyState) {
  mongoose.connect(uri, { dbName: 'autoRack' }).catch(err => console.error('MongoDB connection error:', err))
}


export async function GET() {
  try {
    const items = await Inventory.find()
    return NextResponse.json(items, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, size, quantityChange } = body

    if (!id || !['S', 'M', 'L', 'XL'].includes(size) || typeof quantityChange !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const updated = await Inventory.findByIdAndUpdate(
      id,
      { $inc: { [`inventory.${size}`]: quantityChange } },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, size, quantityChange } = body

    if (!id || !['S', 'M', 'L', 'XL'].includes(size) || typeof quantityChange !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const updated = await Inventory.findByIdAndUpdate(
      id,
      { $inc: { [`inventory.${size}`]: quantityChange } },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
