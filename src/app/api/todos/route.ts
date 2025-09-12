import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { completed: "asc" },
        { order: "desc" }, // Newest first (highest order values)
      ],
    });
    return NextResponse.json(todos);
  } catch (err) {
    console.error("Failed to fetch todos:", err);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Get the highest order value for this user and add 10
    const lastTodo = await prisma.todo.findFirst({
      where: {
        userId: session.user.id,
        completed: false,
      },
      orderBy: { order: "desc" },
    });
    const newOrder = (lastTodo?.order || 0) + 10;

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        order: newOrder,
        userId: session.user.id,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (err) {
    console.error("Failed to create todo:", err);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
