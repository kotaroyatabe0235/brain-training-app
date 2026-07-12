import { z } from 'zod'

export const submitScoreSchema = z.object({
  gameId: z.string().min(1),
  score: z.number().int().min(0),
  difficulty: z.enum(['easy', 'normal', 'hard']),
  duration: z.number().int().min(0),
})

export type SubmitScoreInput = z.infer<typeof submitScoreSchema>
