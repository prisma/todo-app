import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: [
        { completed: 'asc' },
        { order: 'desc' }  // Newest first (highest order values)
      ]
    })
    return NextResponse.json(todos)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    
    // Get the highest order value and add 10
    const lastTodo = await prisma.todo.findFirst({
      where: { completed: false },
      orderBy: { order: 'desc' }
    })
    const newOrder = (lastTodo?.order || 0) + 10
    
    const todo = await prisma.todo.create({
      data: { title, order: newOrder }
    })
    
    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}