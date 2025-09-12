'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Todo {
  id: string
  title: string
  completed: boolean
  order: number
  createdAt: string
  updatedAt: string
  isAnimating?: boolean
  isRemoving?: boolean
}

// Sortable Todo Item Component
function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  isEditing,
  editText,
  onEditTextChange,
  onEditSave,
  onEditCancel,
  onEditKeyDown,
  isDragging = false
}: {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  isEditing: boolean
  editText: string
  onEditTextChange: (text: string) => void
  onEditSave: (id: string) => void
  onEditCancel: () => void
  onEditKeyDown: (e: React.KeyboardEvent, id: string) => void
  isDragging?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TodoItem
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        isEditing={isEditing}
        editText={editText}
        onEditTextChange={onEditTextChange}
        onEditSave={onEditSave}
        onEditCancel={onEditCancel}
        onEditKeyDown={onEditKeyDown}
        dragHandleProps={listeners}
      />
    </div>
  )
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  isEditing,
  editText,
  onEditTextChange,
  onEditSave,
  onEditCancel,
  onEditKeyDown,
  dragHandleProps
}: {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  isEditing: boolean
  editText: string
  onEditTextChange: (text: string) => void
  onEditSave: (id: string) => void
  onEditCancel: () => void
  onEditKeyDown: (e: React.KeyboardEvent, id: string) => void
  dragHandleProps?: Record<string, unknown>
}) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwipeGesture, setIsSwipeGesture] = useState(false)
  const [startX, setStartX] = useState(0)
  const [isDragStart, setIsDragStart] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    setStartX(e.clientX)
    setIsDragStart(true)
    setIsSwipeGesture(false)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragStart) return

    const deltaX = e.clientX - startX
    const absDeltaX = Math.abs(deltaX)

    // If horizontal movement is significant, treat as swipe
    if (absDeltaX > 10) {
      setIsSwipeGesture(true)
      // Only allow left swipe for completed todos
      if (deltaX < 0 && !todo.completed) {
        setSwipeX(0) // Prevent left swipe for incomplete todos
      } else {
        setSwipeX(Math.max(-120, Math.min(120, deltaX)))
      }
    }
  }

  const handlePointerUp = () => {
    setIsDragStart(false)

    if (isSwipeGesture) {
      const threshold = 60

      if (swipeX < -threshold && todo.completed) {
        // Swipe left - delete (only for completed todos)
        onDelete(todo.id)
      } else if (swipeX > threshold) {
        // Swipe right - toggle
        onToggle(todo.id, todo.completed)
      }

      // Reset swipe state
      setTimeout(() => {
        setSwipeX(0)
        setIsSwipeGesture(false)
      }, 150)
    }
  }

  const style = {
    transform: isSwipeGesture ? `translateX(${swipeX}px)` : '',
    transition: isSwipeGesture ? 'none' : 'transform 0.2s ease',
  }

  const bgColor = todo.completed ? 'bg-green-50 bg-opacity-40' : 'bg-transparent hover:bg-blue-50 hover:bg-opacity-30'

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background action hints - show when swipeX is not 0 */}
      {Math.abs(swipeX) > 0 && (
        <div className="absolute inset-0 z-0">
          {/* Delete action (left side) - only for completed todos */}
          {swipeX < 0 && todo.completed && (
            <div
              className="absolute inset-0 bg-red-500 rounded-lg"
              style={{
                opacity: Math.min(1, Math.abs(swipeX) / 60)
              }}
            />
          )}

          {/* Toggle action (right side) */}
          {swipeX > 0 && (
            <div
              className={`absolute inset-0 rounded-lg ${
                todo.completed ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{
                opacity: Math.min(1, Math.abs(swipeX) / 60)
              }}
            />
          )}
        </div>
      )}

      {/* Main todo item */}
      <div
        style={style}
        className={`flex items-center gap-3 p-2 rounded-lg ${bgColor} group relative z-10 transition-all duration-200 hover:shadow-sm hover:bg-opacity-50`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1 text-black hover:text-gray-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="9" cy="12" r="1.5"/>
            <circle cx="9" cy="6" r="1.5"/>
            <circle cx="9" cy="18" r="1.5"/>
            <circle cx="15" cy="12" r="1.5"/>
            <circle cx="15" cy="6" r="1.5"/>
            <circle cx="15" cy="18" r="1.5"/>
          </svg>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id, todo.completed)}
            className={`w-5 h-5 rounded-md border-2 flex-shrink-0 ${todo.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-300'
              } transition-colors`}
          />
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onBlur={() => onEditSave(todo.id)}
              onKeyDown={(e) => onEditKeyDown(e, todo.id)}
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium min-w-0 text-gray-700 focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:shadow-sm focus:ring-2 focus:ring-blue-300"
              autoFocus
            />
          ) : (
            <span
              title={todo.title}
              onClick={() => onEdit(todo)}
              className={`flex-1 truncate text-lg font-medium min-w-0 cursor-pointer hover:bg-gray-50 hover:px-2 hover:py-1 hover:rounded transition-all duration-150 ${todo.completed
                  ? 'line-through text-gray-400'
                  : 'text-gray-700'
                }`}
            >
              {todo.title}
            </span>
          )}
        </div>
        {todo.completed && (
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 10) return 'just now'
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [completedExpanded, setCompletedExpanded] = useState(true)
  const [activeExpanded, setActiveExpanded] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchTodos()
  }, [])

  useEffect(() => {
    // Focus the input after initial render
    if (inputRef.current && !loading) {
      inputRef.current.focus()
    }
  }, [loading])

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        console.log('📥 Fetched todos from database:', data.map(t => `${t.title}:${t.order}${t.completed ? '✅' : ''}`))
        setTodos(data)
        setLastSyncTime(new Date()) // Set sync time for both initial load and refreshes
      } else {
        console.error('Invalid response:', data)
        setTodos([])
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
      setTodos([])
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const lastTodo = todos.filter(t => !t.completed).sort((a, b) => b.order - a.order)[0]
    const newOrder = (lastTodo?.order || 0) + 10

    const optimisticTodo: Todo = {
      id: tempId,
      title: newTodo.trim(),
      completed: false,
      order: newOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAnimating: true
    }

    // Optimistic update with animation
    setTodos(prev => [optimisticTodo, ...prev])
    setNewTodo('')

    // Remove animation after brief delay
    setTimeout(() => {
      setTodos(prev => prev.map(todo =>
        todo.id === tempId ? { ...todo, isAnimating: false } : todo
      ))
    }, 100)

    setIsSyncing(true)
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: optimisticTodo.title })
      })

      if (response.ok) {
        const newTodo = await response.json()
        // Replace temp todo with real one
        setTodos(prev => prev.map(todo =>
          todo.id === tempId ? newTodo : todo
        ))
        setLastSyncTime(new Date())
      } else {
        // Remove optimistic todo on failure
        setTodos(prev => prev.filter(todo => todo.id !== tempId))
        setNewTodo(optimisticTodo.title) // Restore input
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      // Remove optimistic todo on failure
      setTodos(prev => prev.filter(todo => todo.id !== tempId))
      setNewTodo(optimisticTodo.title) // Restore input
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    // Optimistic update
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, completed: !completed }
        : todo
    ))

    setIsSyncing(true)
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })

      if (!response.ok) {
        // Revert on failure
        setTodos(prev => prev.map(todo =>
          todo.id === id
            ? { ...todo, completed }
            : todo
        ))
      } else {
        setLastSyncTime(new Date())
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      // Revert on failure
      setTodos(prev => prev.map(todo =>
        todo.id === id
          ? { ...todo, completed }
          : todo
      ))
    } finally {
      setIsSyncing(false)
    }
  }

  const deleteTodo = async (id: string) => {
    // Store the todo for potential restoration
    const todoToDelete = todos.find(todo => todo.id === id)
    if (!todoToDelete) return

    // Optimistic update - remove immediately
    setTodos(prev => prev.filter(todo => todo.id !== id))

    setIsSyncing(true)
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        // Restore todo on failure
        setTodos(prev => [todoToDelete, ...prev])
      } else {
        setLastSyncTime(new Date())
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      // Restore todo on failure
      setTodos(prev => [todoToDelete, ...prev])
    } finally {
      setIsSyncing(false)
    }
  }

  const deleteAllCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed)
    if (completedTodos.length === 0) return

    // Optimistic update - remove all completed todos immediately
    setTodos(prev => prev.filter(todo => !todo.completed))

    setIsSyncing(true)
    try {
      // Delete all completed todos in parallel
      await Promise.all(
        completedTodos.map(todo =>
          fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
        )
      )
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Error deleting completed todos:', error)
      // Restore all completed todos on failure
      setTodos(prev => [...completedTodos, ...prev])
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTodo = todos.find(todo => todo.id === activeId)
    const overTodo = todos.find(todo => todo.id === overId)

    if (!activeTodo || !overTodo) return

    // Check if we're moving between sections
    const movingBetweenSections = activeTodo.completed !== overTodo.completed

    // Update the UI immediately and calculate new orders
    const newTodosState = (() => {
      const oldIndex = todos.findIndex(todo => todo.id === activeId)
      const newIndex = todos.findIndex(todo => todo.id === overId)

      let newTodos = arrayMove(todos, oldIndex, newIndex)

      // If moving between sections, update completed status
      if (movingBetweenSections) {
        newTodos = newTodos.map(todo => 
          todo.id === activeId 
            ? { ...todo, completed: overTodo.completed }
            : todo
        )
      }

      // COMPLETELY RECALCULATE ALL ORDER VALUES to match current UI state
      // Separate active and completed todos as they appear in the UI
      const activeTodosInOrder = newTodos.filter(t => !t.completed)
      const completedTodosInOrder = newTodos.filter(t => t.completed)

      // Assign order values that match the descending sort (b.order - a.order)
      // Higher order values appear first, so first item gets highest order
      const maxOrder = Math.max(1000, (activeTodosInOrder.length + completedTodosInOrder.length) * 10)
      
      activeTodosInOrder.forEach((todo, index) => {
        todo.order = maxOrder - (index * 10) // First item gets maxOrder, second gets maxOrder-10, etc.
      })
      
      completedTodosInOrder.forEach((todo, index) => {
        todo.order = maxOrder - (activeTodosInOrder.length * 10) - (index * 10)
      })

      console.log('Updated orders - Active:', activeTodosInOrder.map(t => `${t.title}:${t.order}`))
      console.log('Updated orders - Completed:', completedTodosInOrder.map(t => `${t.title}:${t.order}`))

      return newTodos
    })()

    // Update the UI state
    setTodos(newTodosState)

    // Update backend - update ALL todos to ensure complete consistency
    setIsSyncing(true)
    try {
      console.log('Starting database update...')
      
      // First update completed status if moving between sections
      if (movingBetweenSections) {
        await fetch(`/api/todos/${activeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: overTodo.completed })
        })
      }

      // Update ALL todos' order values in the database to ensure complete consistency
      const allOrderUpdates = newTodosState.map(todo => ({ 
        id: todo.id, 
        order: todo.order 
      }))

      console.log(`Sending ${allOrderUpdates.length} order updates to database`)

      const reorderResponse = await fetch('/api/todos/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          updates: allOrderUpdates
        })
      })

      if (!reorderResponse.ok) {
        throw new Error(`Reorder API failed with status ${reorderResponse.status}`)
      }

      console.log('✅ Database update successful!')
      setLastSyncTime(new Date())

    } catch (error) {
      console.error('❌ Database update failed:', error)
      // Revert the optimistic update on failure
      void fetchTodos()
    } finally {
      setIsSyncing(false)
    }
  }

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.title)
  }

  const handleEditSave = async (id: string) => {
    if (!editText.trim()) {
      handleEditCancel()
      return
    }

    const originalTodo = todos.find(t => t.id === id)
    if (!originalTodo || originalTodo.title === editText.trim()) {
      handleEditCancel()
      return
    }

    // Store the trimmed text
    const trimmedTitle = editText.trim()
    
    setEditingId(null)
    setEditText('')

    // Optimistic update - only update the title, preserve everything else
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, title: trimmedTitle } : todo
    ))

    setIsSyncing(true)
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle })
      })

      if (!response.ok) {
        console.error('Failed to update todo on server')
        // Revert on failure - restore original title
        setTodos(prev => prev.map(todo => 
          todo.id === id ? { ...todo, title: originalTodo.title } : todo
        ))
      } else {
        setLastSyncTime(new Date())
      }
      // On success, keep the optimistic update (no need to replace with server response)
    } catch (error) {
      console.error('Error updating todo:', error)
      // Revert on failure - restore original title
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, title: originalTodo.title } : todo
      ))
    } finally {
      setIsSyncing(false)
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEditSave(id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleEditCancel()
    }
  }

  const draggedTodo = activeId ? todos.find(todo => todo.id === activeId) : null


  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  const activeTodos = todos.filter(todo => !todo.completed).sort((a, b) => b.order - a.order)
  const completedTodos = todos.filter(todo => todo.completed).sort((a, b) => b.order - a.order)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
        <div className="max-w-2xl mx-auto">

          {/* Notebook Body */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-2xl rounded-xl border border-amber-200 relative">
            {/* Notebook Lines Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="h-full bg-gradient-to-b from-transparent via-blue-200 to-transparent bg-[length:100%_24px] bg-repeat-y" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #3b82f6 23px, #3b82f6 24px)' }}></div>
            </div>

            {/* Red Margin Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-red-300 opacity-30"></div>

            <div className="relative px-8 py-6">

              {/* Add New Todo */}
              <form onSubmit={addTodo} className="mb-10">
                <div className="bg-amber-50 bg-opacity-60 rounded-lg p-4 border border-amber-200 shadow-sm hover:bg-amber-100 hover:bg-opacity-70 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                  <div className="flex gap-3 items-center pl-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600" aria-hidden="true">
                      <path d="m18 2 4 4-14 14H4v-4L18 2z" />
                      <path d="M14.5 5.5 18.5 9.5" />
                    </svg>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a Task"
                      className="flex-1 bg-transparent border-none outline-none text-xl text-gray-700 placeholder-gray-500 font-medium py-2"
                    />
                    {/* Sync Status Dot */}
                    <div className="flex-shrink-0">
                      {isSyncing ? (
                        <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : lastSyncTime ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </form>

              {/* Active Todos */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 pl-6">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <button
                    type="button"
                    onClick={() => setActiveExpanded(!activeExpanded)}
                    className="flex items-center gap-2 text-xl font-bold text-gray-700 hover:text-gray-800"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${activeExpanded ? 'rotate-90' : ''}`}
                      aria-hidden="true"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    Todo ({activeTodos.length})
                  </button>
                </div>
                {activeExpanded && (
                  <div>
                    {activeTodos.length === 0 ? (
                      <p className="text-gray-400 text-center py-8 pl-6 font-medium">All caught up! 🎉</p>
                    ) : (
                      <SortableContext items={activeTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-0.5">
                          {activeTodos.map((todo) => (
                            <SortableTodoItem
                              key={todo.id}
                              todo={todo}
                              onToggle={toggleTodo}
                              onDelete={deleteTodo}
                              onEdit={handleEditStart}
                              isEditing={editingId === todo.id}
                              editText={editText}
                              onEditTextChange={setEditText}
                              onEditSave={handleEditSave}
                              onEditCancel={handleEditCancel}
                              onEditKeyDown={handleEditKeyDown}
                              isDragging={todo.id === activeId}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </div>
                )}
              </div>

              {/* Completed Todos */}
              {completedTodos.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <button
                        type="button"
                        onClick={() => setCompletedExpanded(!completedExpanded)}
                        className="flex items-center gap-2 text-xl font-bold text-gray-600 hover:text-gray-700"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform duration-200 ${completedExpanded ? 'rotate-90' : ''}`}
                          aria-hidden="true"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                        Done ({completedTodos.length})
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={deleteAllCompleted}
                      className="px-3 py-1 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full border border-red-300 hover:border-red-400 transition-all duration-200"
                    >
                      Clear All Done
                    </button>
                  </div>
                  {completedExpanded && (
                    <SortableContext items={completedTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-0.5">
                        {completedTodos.map((todo) => (
                          <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                            onEdit={handleEditStart}
                            isEditing={editingId === todo.id}
                            editText={editText}
                            onEditTextChange={setEditText}
                            onEditSave={handleEditSave}
                            onEditCancel={handleEditCancel}
                            onEditKeyDown={handleEditKeyDown}
                            isDragging={todo.id === activeId}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {draggedTodo ? (
          <div className="transform rotate-3 shadow-2xl">
            <TodoItem
              todo={draggedTodo}
              onToggle={() => {}}
              onDelete={() => {}}
              onEdit={() => {}}
              isEditing={false}
              editText=""
              onEditTextChange={() => {}}
              onEditSave={() => {}}
              onEditCancel={() => {}}
              onEditKeyDown={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}