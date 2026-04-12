import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Master of Courses'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#534AB7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: 'white', marginBottom: 24 }}>
          Master of Courses
        </div>
        <div style={{ fontSize: 32, color: '#EEEDFE', textAlign: 'center' }}>
          Crea lezioni straordinarie con l&apos;intelligenza artificiale
        </div>
        <div style={{ marginTop: 48, fontSize: 24, color: '#AFA9EC' }}>
          Per i docenti delle scuole superiori italiane
        </div>
      </div>
    ),
    { ...size }
  )
}
