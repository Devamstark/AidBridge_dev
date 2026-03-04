import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

export function handleHttpError(res: NextApiResponse, error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof z.ZodError) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: error.errors 
    })
  }
  
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (error.message === 'Not found') {
      return res.status(404).json({ error: 'Not found' })
    }
  }
  
  return res.status(500).json({ error: 'Internal server error' })
}

export function methodNotAllowed(res: NextApiResponse, allowedMethods: string[]) {
  return res.status(405).json({ 
    error: 'Method not allowed',
    allowed: allowedMethods 
  })
}
