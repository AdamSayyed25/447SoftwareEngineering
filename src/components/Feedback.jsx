import React, { useState } from 'react'

export default function Feedback() {
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [saved, setSaved] = useState(false)

  function submit(e) {
    e.preventDefault()
    const fb = JSON.parse(localStorage.getItem('feedback') || '[]')
    fb.push({ id: Date.now(), text, rating, createdAt: new Date().toISOString() })
    localStorage.setItem('feedback', JSON.stringify(fb))
    setSaved(true)
  }

  return (
    <div className="page feedback-page">
      <h2>Feedback</h2>
      {saved ? (
        <div className="notice">Thanks — your feedback was saved locally for demo purposes.</div>
      ) : (
        <form onSubmit={submit} className="feedback-form">
          <label>
            Rating (1–5)
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
            />
          </label>
          <label>
            Comments
            <textarea value={text} onChange={e => setText(e.target.value)} rows={6} />
          </label>
          <button type="submit">Submit Feedback</button>
        </form>
      )}
    </div>
  )
}
