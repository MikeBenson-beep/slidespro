export interface DownloadRecord {
  lessonId: string
  lessonTitle: string
  fileName: string
  downloadDate: string
  fileSize?: number
}

class DownloadTracker {
  private static readonly STORAGE_KEY = 'lesson_downloads'

  static addDownload(lessonId: string, lessonTitle: string, fileName: string, fileSize?: number): void {
    const downloads = this.getDownloads()
    const newRecord: DownloadRecord = {
      lessonId,
      lessonTitle,
      fileName,
      downloadDate: new Date().toISOString(),
      fileSize
    }
    
    // Remove existing record if it exists
    const filteredDownloads = downloads.filter(d => d.lessonId !== lessonId)
    filteredDownloads.push(newRecord)
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredDownloads))
  }

  static getDownloads(): DownloadRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static isDownloaded(lessonId: string): boolean {
    const downloads = this.getDownloads()
    return downloads.some(d => d.lessonId === lessonId)
  }

  static getDownloadInfo(lessonId: string): DownloadRecord | null {
    const downloads = this.getDownloads()
    return downloads.find(d => d.lessonId === lessonId) || null
  }

  static removeDownload(lessonId: string): void {
    const downloads = this.getDownloads()
    const filteredDownloads = downloads.filter(d => d.lessonId !== lessonId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredDownloads))
  }

  static clearAllDownloads(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getDownloadedLessons(): DownloadRecord[] {
    return this.getDownloads()
  }
}

export default DownloadTracker
