// frontend/src/components/marketplace/ReviewSystem.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { bookingsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Alert, Card, Button, Spinner, EmptyState } from '../shared';

// ── Star rating UI ────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange && onChange(star)}
        style={{
          background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default',
          fontSize: '1.5rem', color: star <= value ? '#f6ad55' : '#e2e8f0',
        }}
      >
        ★
      </button>
    ))}
  </div>
);

// ── Review submission form ─────────────────────────────────────────────────────
const ReviewForm = ({ bookingId, onSubmitted }) => {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError('Please select a star rating.');
    setLoading(true);
    setError('');
    try {
      await bookingsApi.submitReview({ bookingId, rating, comment });
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <h4 style={{ margin: '0 0 10px', color: '#2d3748' }}>Leave a Review</h4>
      <Alert type="error" message={error} />
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience…"
        rows={3}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical', marginBottom: 10 }}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  );
};

// ── Main ReviewSystem ─────────────────────────────────────────────────────────
const ReviewSystem = ({ bookingId }) => {
  const { user } = useAuth();
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await bookingsApi.getReviews(bookingId);
      setReviews(res.data.reviews || []);
    } catch {
      // non-critical; silently fail
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleReviewSubmitted = () => {
    setShowForm(false);
    loadReviews();
  };

  if (!bookingId) return null;

  return (
    <Card style={{ marginTop: 24 }}>
      <h3 style={{ margin: '0 0 16px', color: '#2d3748' }}>⭐ Reviews</h3>

      {loading ? <Spinner size={28} /> : reviews.length === 0 ? (
        <EmptyState icon="⭐" title="No reviews yet" subtitle="Be the first to review this service." />
      ) : (
        reviews.map((r) => (
          <div key={r.id} style={{ borderBottom: '1px solid #edf2f7', paddingBottom: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <strong style={{ color: '#2d3748' }}>{r.reviewer_name}</strong>
              <StarRating value={r.rating} />
            </div>
            {r.comment && <p style={{ margin: 0, color: '#4a5568', fontSize: '0.9rem' }}>{r.comment}</p>}
          </div>
        ))
      )}

      {user && !showForm && (
        <Button variant="ghost" onClick={() => setShowForm(true)} style={{ marginTop: 8 }}>
          + Write a Review
        </Button>
      )}
      {showForm && <ReviewForm bookingId={bookingId} onSubmitted={handleReviewSubmitted} />}
    </Card>
  );
};

export default ReviewSystem;
