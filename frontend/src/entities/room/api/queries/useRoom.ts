import { useQuery } from '@tanstack/react-query'

import { roomQueryOptions } from './roomQueryOptions'

export const useRoom = (roomId: number) => useQuery(roomQueryOptions(roomId))
