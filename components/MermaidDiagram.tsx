"use client"

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    })
  }, [])

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = chart
      ref.current.removeAttribute('data-processed')
      mermaid.run({
        querySelector: '.mermaid',
      }).catch((err) => {
        console.error('Mermaid rendering error:', err)
      })
    }
  }, [chart])

  return (
    <div className="flex justify-center items-center w-full">
      <div ref={ref} className="mermaid">
        {chart}
      </div>
    </div>
  )
}

