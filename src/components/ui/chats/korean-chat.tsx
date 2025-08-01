'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GrowableTextarea } from '@/components/ui/growable-textarea'
import { useChat } from '@ai-sdk/react'
import { Send, MoreHorizontal, Phone, Search, Home, HelpCircle } from 'lucide-react'
import type React from 'react'
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export function KoreanChat() {
    const { messages, input, handleInputChange, handleSubmit: sendChatMessage, status } = useChat()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [showFAQSuggestions, setShowFAQSuggestions] = useState(true)

    const handleSubmit = useCallback(
        (event: SyntheticEvent) => {
            event.preventDefault()

            const cookies = document.cookie.split(';')
            const studentCookie = cookies.find((cookie) =>
                cookie.trim().startsWith('student_token=')
            )

            const student_token = studentCookie?.split('=')[1]

            fetch(`${process.env.NEXT_PUBLIC_LOG_URL}/api/log-usage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_token,
                    action: 'msg_sent',
                    source_app: 'chat',
                    details: { message: input },
                }),
            })

            sendChatMessage(event)
        },
        [input, sendChatMessage]
    )

    useEffect(() => {
        if (status !== 'ready') return
        const lastMessage = messages[messages.length - 1]
        if (lastMessage?.role !== 'assistant') return

        const cookies = document.cookie.split(';')
        const studentCookie = cookies.find((cookie) => cookie.trim().startsWith('student_token='))

        const student_token = studentCookie?.split('=')[1]

        fetch(`${process.env.NEXT_PUBLIC_LOG_URL}/api/log-usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_token,
                action: 'msg_recieved',
                source_app: 'chat',
                details: { message: lastMessage.content },
            }),
        })
    }, [messages, status])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
    }

    const handleFAQClick = (question: string) => {
        const syntheticEvent = {
            preventDefault: () => {},
        } as React.FormEvent<HTMLFormElement>

        handleInputChange({
            target: { value: question },
        } as React.ChangeEvent<HTMLInputElement>)

        setTimeout(() => {
            handleSubmit(syntheticEvent)
            setShowFAQSuggestions(false)
        }, 100)
    }

    const learningTopics = [
        {
            id: 'grammar-help',
            category: '문법',
            question: '한국어 문법이 어려워요',
            keywords: ['문법', '어려운', '도움'],
        },
        {
            id: 'pronunciation',
            category: '발음',
            question: '발음을 연습하고 싶어요',
            keywords: ['발음', '연습', '말하기'],
        },
        {
            id: 'daily-conversation',
            category: '회화',
            question: '일상 대화를 배우고 싶어요',
            keywords: ['대화', '일상', '회화'],
        },
        {
            id: 'korean-culture',
            category: '문화',
            question: '한국 문화가 궁금해요',
            keywords: ['문화', '한국', '생활'],
        },
    ]

    return (
        <div className="mx-auto flex h-full flex-col overflow-hidden bg-gradient-to-b from-blue-50 to-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 shadow-lg">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border-2 border-white bg-[#667ca9] p-1">
                        <AvatarImage src="/favicon.svg?height=40&width=40" />
                        <AvatarFallback className="bg-blue-500 text-sm font-bold text-white">
                            한
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-sm font-bold text-white">한국어 어학원</h1>
                        <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 rounded-full bg-green-400"></div>
                            <p className="text-xs text-blue-100">한국어 선생님 도우미</p>
                        </div>
                    </div>
                </div>
                {/* temp hidden options */}
                <div className="hidden space-x-1">
                    <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-blue-500">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-blue-500">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-blue-500">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 && (
                    <div className="space-y-4">
                        {/* Welcome Message */}
                        <div className="text-center text-gray-500">
                            <div className="mx-2 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                                <div className="mb-2 flex items-center justify-center space-x-2">
                                    <Home className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-800">
                                        한국어 어학원 도우미
                                    </h3>
                                </div>
                                <p className="mb-2 text-sm text-gray-600">안녕하세요! 👋</p>
                                <p className="text-sm text-gray-600">한국어 공부를 도와드릴게요!</p>
                                <div className="mx-auto flex w-fit items-center space-x-4 pt-2 text-sm text-gray-600">
                                    <a
                                        className="border-b border-transparent text-blue-600 transition-colors hover:border-blue-600 focus:border-blue-600"
                                        href="/legal/privacy"
                                    >
                                        개인정보처리방침
                                    </a>
                                    <span className="inline-block h-1 w-1 rounded-full bg-gray-400"></span>
                                    <a
                                        className="border-b border-transparent text-blue-600 transition-colors hover:border-blue-600 focus:border-blue-600"
                                        href="/legal/terms"
                                    >
                                        이용약관
                                    </a>
                                </div>
                                <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-blue-600">
                                    <HelpCircle className="h-4 w-4" />
                                    <span>언제든지 질문하세요!</span>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Suggestions */}
                        {showFAQSuggestions && (
                            <div className="space-y-2">
                                <p className="text-center text-xs font-medium text-gray-500">
                                    한국어 학습 도움
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    {learningTopics.map((topic) => (
                                        <button
                                            key={topic.id}
                                            onClick={() => handleFAQClick(topic.question)}
                                            className="rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Badge
                                                        variant="secondary"
                                                        className="mb-1 bg-blue-100 text-xs text-blue-700"
                                                    >
                                                        {topic.category}
                                                    </Badge>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {topic.question}
                                                    </p>
                                                </div>
                                                <HelpCircle className="ml-2 mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={message.id || index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`flex max-w-[85%] items-end space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                        >
                            {message.role === 'assistant' && (
                                <Avatar className="mb-1 h-8 w-8 border border-blue-200">
                                    <AvatarImage src="/favicon.svg?height=32&width=32" />
                                    <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">
                                        SH
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div className="flex flex-col">
                                <div
                                    className={`rounded-2xl px-4 py-3 ${
                                        message.role === 'user'
                                            ? 'rounded-br-md bg-blue-600 text-white shadow-md'
                                            : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 shadow-sm'
                                    }`}
                                >
                                    <div className="min-w-0 overflow-auto whitespace-pre-wrap break-words break-all text-sm leading-relaxed">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>
                                </div>
                                <p
                                    className={`mt-1 text-xs text-gray-500 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                                >
                                    {formatTime(new Date())}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {status === 'submitted' && (
                    <div className="flex justify-start">
                        <div className="flex max-w-[80%] items-end space-x-2">
                            <Avatar className="mb-1 h-8 w-8 border border-blue-200">
                                <AvatarImage src="/favicon.svg?height=32&width=32" />
                                <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">
                                    SH
                                </AvatarFallback>
                            </Avatar>
                            <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></div>
                                    <div
                                        className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                                        style={{ animationDelay: '0.1s' }}
                                    ></div>
                                    <div
                                        className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                                        style={{ animationDelay: '0.2s' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="w-full overflow-hidden border-t border-gray-200 bg-white p-4 shadow-lg">
                <form
                    onSubmit={handleSubmit}
                    className="flex w-full min-w-0 items-center justify-start gap-x-3"
                >
                    <GrowableTextarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="어떤 언어로 질문해보세요..."
                        autoFocus
                        disabled={status !== 'ready'}
                        onEnter={(e) => {
                            const textarea = e.target as HTMLTextAreaElement
                            const form = textarea.closest('form')
                            if (form) form.requestSubmit()
                        }}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="size-10 min-w-10 rounded-full bg-blue-600 p-2 text-white shadow-md hover:bg-blue-700"
                        disabled={status !== 'ready' || !input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">한국어 어학원 선생님 도우미</p>
                </div>
            </div>
        </div>
    )
}
