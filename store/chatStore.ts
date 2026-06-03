import { create } from 'zustand'
import type { MsgType } from '@prisma/client'

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string | null
  type: MsgType
  createdAt: Date
}

interface ChatStore {
  activeConversationId: string | null
  messages: Record<string, ChatMessage[]>
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  clearMessages: (conversationId: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  messages: {},
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), message],
      },
    })),
  clearMessages: (conversationId) =>
    set((state) => {
      const { [conversationId]: _, ...rest } = state.messages
      return { messages: rest }
    }),
}))
