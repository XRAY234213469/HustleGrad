// frontend/src/api/index.js
import client from './client';

export const authApi = {
  register:       (data)         => client.post('/auth/register', data),
  login:          (data)         => client.post('/auth/login', data),
  verify2FA:      (userId, code) => client.post('/auth/verify-2fa', { userId, tfaCode: code }),
  me:             ()             => client.get('/auth/me'),
  forgotPassword: (admissionNumber) => client.post('/auth/forgot-password', { admissionNumber }),
  resetPassword:  (data)         => client.post('/auth/reset-password', data),
};

export const profilesApi = {
  updateProfilePicture: (imageDataUrl) =>
    client.patch('/profiles/me/profile-picture', { imageDataUrl }),
};

export const listingsApi = {
  search:       (params) => client.get('/listings', { params }),
  topHustlers:  ()       => client.get('/listings/top/hustlers'),
  getById:      (id)     => client.get(`/listings/${id}`),
  create:       (data)   => client.post('/listings', data),
  getDashboard: ()       => client.get('/listings/my/dashboard'),
};

export const bookingsApi = {
  create:                 (data)      => client.post('/bookings', data),
  getVendorNotifications: ()          => client.get('/bookings/vendor/notifications'),
  markComplete:           (bookingId) => client.patch(`/bookings/${bookingId}/complete`),
  submitReview:           (data)      => client.post('/bookings/reviews', data),
  getReviews:             (bookingId) => client.get(`/bookings/${bookingId}/reviews`),
};

export const messagesApi = {
  send:      (data)                   => client.post('/messages', data),
  getInbox:  ()                       => client.get('/messages/inbox'),
  getThread: (otherUserId, listingId) => client.get(`/messages/thread/${otherUserId}/${listingId}`),
};

export const adminApi = {
  getStats:      ()   => client.get('/admin/stats'),
  getUsers:      ()   => client.get('/admin/users'),
  getListings:   ()   => client.get('/admin/listings'),
  deleteListing: (id) => client.delete(`/admin/listings/${id}`),
};
