import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { lessonId, slideId, field, value } = await request.json()

    if (!lessonId || !slideId || !field || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Read the current slides.json file
    const slidesPath = path.join(process.cwd(), 'slides.json')
    const slidesData = JSON.parse(fs.readFileSync(slidesPath, 'utf8'))

    // Find the lesson
    const lessonIndex = slidesData.lessons.findIndex((lesson: any) => lesson.id === lessonId)
    if (lessonIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Find the slide
    const slideIndex = slidesData.lessons[lessonIndex].slides.findIndex((slide: any) => slide.id === slideId)
    if (slideIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Slide not found' },
        { status: 404 }
      )
    }

    // Update the field
    if (field.includes('.')) {
      // Handle nested fields like 'math.0.label'
      const parts = field.split('.')
      let target = slidesData.lessons[lessonIndex].slides[slideIndex]
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (isNaN(Number(part))) {
          target = target[part]
        } else {
          target = target[Number(part)]
        }
      }
      
      const lastPart = parts[parts.length - 1]
      if (isNaN(Number(lastPart))) {
        target[lastPart] = value
      } else {
        target[Number(lastPart)] = value
      }
    } else {
      // Handle direct fields
      slidesData.lessons[lessonIndex].slides[slideIndex][field] = value
    }

    // Write the updated data back to the file
    fs.writeFileSync(slidesPath, JSON.stringify(slidesData, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating slide:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update slide' },
      { status: 500 }
    )
  }
}
