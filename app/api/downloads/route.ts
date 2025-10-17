import { NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const downloadsDir = join(process.cwd(), 'downloads')
    const files = await readdir(downloadsDir)
    
    const fileList = await Promise.all(
      files.map(async (file) => {
        const filePath = join(downloadsDir, file)
        const stats = await stat(filePath)
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime
        }
      })
    )
    
    return NextResponse.json({ files: fileList })
  } catch (error) {
    console.error('Error reading downloads directory:', error)
    return NextResponse.json(
      { error: 'Failed to read downloads directory' },
      { status: 500 }
    )
  }
}
