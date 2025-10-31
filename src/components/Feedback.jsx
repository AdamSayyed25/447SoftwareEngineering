import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { feedbackAPI } from '../services/api'

export default function Feedback() {
  const { state } = useLocation()
  const orderId = state?.orderId
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await feedbackAPI.submit({ orderId, rating, comment: text })
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Failed to submit feedback')
    }
  }

  return (
    <div className="page feedback-page">
      <h2>Feedback</h2>
      {saved ? (
        <div className="notice">Thanks — your feedback was saved!</div>
      ) : (
        <form onSubmit={submit} className="feedback-form">
          {error && <div className="error">{error}</div>}
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
