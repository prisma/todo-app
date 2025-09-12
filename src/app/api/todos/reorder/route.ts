import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const { updates } = await request.json()
    
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates must be an array' }, { status: 400 })
    }
    
    // Validate the updates format
    for (const update of updates) {
      if (!update.id || typeof update.order !== 'number') {
        return NextResponse.json({ error: 'Each update must have id and order' }, { status: 400 })
      }
    }
    
    // Update all todos in a transaction
    const updatedTodos = await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.todo.update({
          where: { id },
          data: { order }
        })
      )
    )
    
    return NextResponse.json(updatedTodos)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder todos' }, { status: 500 })
  }
}