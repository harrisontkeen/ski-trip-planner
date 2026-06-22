import rateLimit from 'express-rate-limit'

const opts = { standardHeaders: true, legacyHeaders: false }

export const globalLimiter = rateLimit({
  ...opts,
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
})

export const generateLimiter = rateLimit({
  ...opts,
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { success: false, error: 'Too many trip requests. Please wait before trying again.' }
})
