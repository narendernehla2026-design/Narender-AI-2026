import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AssistantChat, AssistantChatInput, AssistantMemoryInput, AssistantMemoryItem, AssistantMessage, AssistantMessageInput, AssistantProfile, AssistantProfileUpdate, HealthStatus } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAssistantProfileUrl: () => string;
/**
 * @summary Get the signed-in user's assistant profile
 */
export declare const getAssistantProfile: (options?: Parameters<typeof customFetch>[1]) => Promise<AssistantProfile>;
export declare const getGetAssistantProfileQueryKey: () => readonly ["/api/assistant/profile"];
export declare const getGetAssistantProfileQueryOptions: <TData = Awaited<ReturnType<typeof getAssistantProfile>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAssistantProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAssistantProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAssistantProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getAssistantProfile>>>;
export type GetAssistantProfileQueryError = ErrorType<void>;
/**
 * @summary Get the signed-in user's assistant profile
 */
export declare function useGetAssistantProfile<TData = Awaited<ReturnType<typeof getAssistantProfile>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAssistantProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAssistantProfileUrl: () => string;
/**
 * @summary Update the signed-in user's assistant profile
 */
export declare const updateAssistantProfile: (assistantProfileUpdate: AssistantProfileUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<AssistantProfile>;
export declare const getUpdateAssistantProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAssistantProfile>>, TError, {
        data: BodyType<AssistantProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAssistantProfile>>, TError, {
    data: BodyType<AssistantProfileUpdate>;
}, TContext>;
export type UpdateAssistantProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateAssistantProfile>>>;
export type UpdateAssistantProfileMutationBody = BodyType<AssistantProfileUpdate>;
export type UpdateAssistantProfileMutationError = ErrorType<unknown>;
/**
* @summary Update the signed-in user's assistant profile
*/
export declare const useUpdateAssistantProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAssistantProfile>>, TError, {
        data: BodyType<AssistantProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAssistantProfile>>, TError, {
    data: BodyType<AssistantProfileUpdate>;
}, TContext>;
export declare const getListAssistantChatsUrl: () => string;
/**
 * @summary List the signed-in user's recent chats
 */
export declare const listAssistantChats: (options?: Parameters<typeof customFetch>[1]) => Promise<AssistantChat[]>;
export declare const getListAssistantChatsQueryKey: () => readonly ["/api/assistant/chats"];
export declare const getListAssistantChatsQueryOptions: <TData = Awaited<ReturnType<typeof listAssistantChats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssistantChats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAssistantChats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAssistantChatsQueryResult = NonNullable<Awaited<ReturnType<typeof listAssistantChats>>>;
export type ListAssistantChatsQueryError = ErrorType<unknown>;
/**
 * @summary List the signed-in user's recent chats
 */
export declare function useListAssistantChats<TData = Awaited<ReturnType<typeof listAssistantChats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssistantChats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAssistantChatUrl: () => string;
/**
 * @summary Create a new chat session
 */
export declare const createAssistantChat: (assistantChatInput?: AssistantChatInput, options?: Parameters<typeof customFetch>[1]) => Promise<AssistantChat>;
export declare const getCreateAssistantChatMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssistantChat>>, TError, {
        data?: BodyType<AssistantChatInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAssistantChat>>, TError, {
    data?: BodyType<AssistantChatInput>;
}, TContext>;
export type CreateAssistantChatMutationResult = NonNullable<Awaited<ReturnType<typeof createAssistantChat>>>;
export type CreateAssistantChatMutationBody = BodyType<AssistantChatInput> | undefined;
export type CreateAssistantChatMutationError = ErrorType<unknown>;
/**
* @summary Create a new chat session
*/
export declare const useCreateAssistantChat: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssistantChat>>, TError, {
        data?: BodyType<AssistantChatInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAssistantChat>>, TError, {
    data?: BodyType<AssistantChatInput>;
}, TContext>;
export declare const getListAssistantMessagesUrl: (chatId: string) => string;
/**
 * @summary List messages for a chat
 */
export declare const listAssistantMessages: (chatId: string, options?: Parameters<typeof customFetch>[1]) => Promise<AssistantMessage[]>;
export declare const getListAssistantMessagesQueryKey: (chatId: string) => readonly [`/api/assistant/chats/${string}/messages`];
export declare const getListAssistantMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listAssistantMessages>>, TError = ErrorType<unknown>>(chatId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssistantMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAssistantMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAssistantMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listAssistantMessages>>>;
export type ListAssistantMessagesQueryError = ErrorType<unknown>;
/**
 * @summary List messages for a chat
 */
export declare function useListAssistantMessages<TData = Awaited<ReturnType<typeof listAssistantMessages>>, TError = ErrorType<unknown>>(chatId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssistantMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSendAssistantMessageUrl: (chatId: string) => string;
/**
 * @summary Send a message to Narender AI
 */
export declare const sendAssistantMessage: (chatId: string, assistantMessageInput: AssistantMessageInput, options?: Parameters<typeof customFetch>[1]) => Promise<AssistantMessage>;
export declare const getSendAssistantMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendAssistantMessage>>, TError, {
        chatId: string;
        data: BodyType<AssistantMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendAssistantMessage>>, TError, {
    chatId: string;
    data: BodyType<AssistantMessageInput>;
}, TContext>;
export type SendAssistantMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendAssistantMessage>>>;
export type SendAssistantMessageMutationBody = BodyType<AssistantMessageInput>;
export type SendAssistantMessageMutationError = ErrorType<unknown>;
/**
* @summary Send a message to Narender AI
*/
export declare const useSendAssistantMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendAssistantMessage>>, TError, {
        chatId: string;
        data: BodyType<AssistantMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendAssistantMessage>>, TError, {
    chatId: string;
    data: BodyType<AssistantMessageInput>;
}, TContext>;
export declare const getListAssistantMemoryUrl: () => string;
/**
 * @summary List the signed-in user's pinned memory
 */
export declare const listAssistantMemory: (options?: Parameters<typeof customFetch>[1]) => Promise<AssistantMemoryItem[]>;
export declare const getListAssistantMemoryQueryKey: () => readonly ["/api/assistant/memory"];
export declare const getListAssistantMemoryQueryOptions: <TData = Awaited<ReturnType<typeof listAssistantMemory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssistantMemory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAssistantMemory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAssistantMemoryQueryResult = NonNullable<Awaited<ReturnType<typeof listAssistantMemory>>>;
export type ListAssistantMemoryQueryError = ErrorType<unknown>;
/**
 * @summary List the signed-in user's pinned memory
 */
export declare function useListAssistantMemory<TData = Awaited<ReturnType<typeof listAssistantMemory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAssistantMemory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAssistantMemoryUrl: () => string;
/**
 * @summary Add a pinned memory item
 */
export declare const createAssistantMemory: (assistantMemoryInput: AssistantMemoryInput, options?: Parameters<typeof customFetch>[1]) => Promise<AssistantMemoryItem>;
export declare const getCreateAssistantMemoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssistantMemory>>, TError, {
        data: BodyType<AssistantMemoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAssistantMemory>>, TError, {
    data: BodyType<AssistantMemoryInput>;
}, TContext>;
export type CreateAssistantMemoryMutationResult = NonNullable<Awaited<ReturnType<typeof createAssistantMemory>>>;
export type CreateAssistantMemoryMutationBody = BodyType<AssistantMemoryInput>;
export type CreateAssistantMemoryMutationError = ErrorType<unknown>;
/**
* @summary Add a pinned memory item
*/
export declare const useCreateAssistantMemory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAssistantMemory>>, TError, {
        data: BodyType<AssistantMemoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAssistantMemory>>, TError, {
    data: BodyType<AssistantMemoryInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map