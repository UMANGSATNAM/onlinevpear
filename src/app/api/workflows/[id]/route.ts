import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const workflow = await db.workflow.findUnique({
      where: { id },
      include: {
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        _count: { select: { executions: true } },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Workflow GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.workflow.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'trigger', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.conditions && typeof body.conditions === 'object') {
      updateData.conditions = JSON.stringify(body.conditions)
    }
    if (body.actions && typeof body.actions === 'object') {
      updateData.actions = JSON.stringify(body.actions)
    }

    // Update lastRunAt when toggling isActive
    if (body.isActive === true && !existing.isActive) {
      updateData.lastRunAt = new Date()
      updateData.runCount = existing.runCount + 1
    }

    const workflow = await db.workflow.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('Workflow PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.workflow.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    // Delete executions first
    await db.workflowExecution.deleteMany({ where: { workflowId: id } })
    await db.workflow.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Workflow DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
