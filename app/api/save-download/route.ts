import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { pdfData, fileName, lessonId, lessonTitle } = await request.json()
    
    // Ensure downloads directory exists
    const downloadsDir = join(process.cwd(), 'downloads')
    await mkdir(downloadsDir, { recursive: true })
    
    // Convert base64 data to buffer
    const pdfBuffer = Buffer.from(pdfData.split(',')[1], 'base64')
    
    // Save file to downloads directory
    const filePath = join(downloadsDir, fileName)
    await writeFile(filePath, pdfBuffer)
    
    // Get file size
    const fileSize = pdfBuffer.length
    
    return NextResponse.json({ 
      success: true, 
      filePath, 
      fileSize,
      message: 'File saved successfully' 
    })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save file' },
      { status: 500 }
    )
  }
}
