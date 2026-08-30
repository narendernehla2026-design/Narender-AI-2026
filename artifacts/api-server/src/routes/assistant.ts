import { Router, type IRouter, type Request, type Response } from "express";
import {
  CreateAssistantChatBody,
  CreateAssistantMemoryBody,
  GetAssistantProfileResponse,
  ListAssistantChatsResponse,
  ListAssistantMemoryResponse,
  ListAssistantMessagesParams,
  ListAssistantMessagesResponse,
  SendAssistantMessageBody,
  SendAssistantMessageParams,
  UpdateAssistantProfileBody,
} from "@workspace/api-zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRequestContext, PREVIEW_EMAIL } from "../lib/supabase";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type Profile = {
  id: string;
  email: string;
  displayName: string;
  preferredLanguage: string;
  profession: string;
  project: string;
  plan: string;
  avatarUrl: string | null;
};

type Chat = {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
};

type Message = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Memory = {
  id: string;
  category: "meeting" | "code" | "note";
  title: string;
  content: string;
  updatedAt: string;
};

const previewProfile = (userId: string): Profile => ({
  id: userId,
  email: PREVIEW_EMAIL,
  displayName: "Narender",
  preferredLanguage: "Hindi",
  profession: "Software Engineer",
  project: "SaaS Platform",
  plan: "Pro",
  avatarUrl: null,
});

const previewChats: Chat[] = [
  {
    id: "preview-chat",
    title: "Welcome to your workspace",
    updatedAt: new Date().toISOString(),
    messageCount: 1,
  },
];

const previewMessages: Message[] = [
  {
    id: "preview-message",
    chatId: "preview-chat",
    role: "assistant",
    content:
      "Your personal workspace is ready. Connect Supabase and Gemini to unlock live memory, private chat history, and model-powered answers.",
    createdAt: new Date().toISOString(),
  },
];

const previewMemory: Memory[] = [
  {
    id: "preview-meeting",
    category: "meeting",
    title: "Product sync",
    content: "Keep the first release focused on a fast, clear assistant workflow.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "preview-code",
    category: "code",
    title: "API pattern",
    content: "Prefer small typed routes with explicit ownership checks.",
    updatedAt: new Date().toISOString(),
  },
];

function now() {
  return new Date().toISOString();
}

function mapProfile(row: Record<string, unknown>, userId: string, email: string): Profile {
  return {
    id: String(row.id ?? userId),
    email: String(row.email ?? email),
    displayName: String(row.display_name ?? row.displayName ?? "Narender"),
    preferredLanguage: String(row.preferred_language ?? row.preferredLanguage ?? "Hindi"),
    profession: String(row.profession ?? "Software Engineer"),
    project: String(row.project ?? "SaaS Platform"),
    plan: String(row.plan ?? "Pro"),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
  };
}

function mapChat(row: Record<string, unknown>): Chat {
  return {
    id: String(row.id),
    title: String(row.title ?? "Untitled chat"),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? now()),
    messageCount: Number(row.message_count ?? row.messageCount ?? 0),
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id),
    chatId: String(row.chat_id ?? row.chatId),
    role: row.role === "user" ? "user" : "assistant",
    content: String(row.content ?? ""),
    createdAt: String(row.created_at ?? row.createdAt ?? now()),
  };
}

function mapMemory(row: Record<string, unknown>): Memory {
  const category = row.category === "code" || row.category === "note" ? row.category : "meeting";
  return {
    id: String(row.id),
    category,
    title: String(row.title ?? "Untitled memory"),
    content: String(row.content ?? ""),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? now()),
  };
}

async function getProfile(req: Request) {
  const context = await getRequestContext(req);
  if (context.isPreview || !context.client) {
    return { context, profile: previewProfile(context.userId) };
  }

  const { data, error } = await context.client
    .from("profiles")
    .select("*")
    .eq("id", context.userId)
    .maybeSingle();
  if (error) throw error;
  return {
    context,
    profile: mapProfile(data ?? {}, context.userId, context.email),
  };
}

function handleError(res: Response, error: unknown) {
  if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  logger.error({ err: error }, "Assistant request failed");
  res.status(500).json({ error: "Assistant request failed" });
}

router.get("/assistant/profile", async (req, res) => {
  try {
    const { profile } = await getProfile(req);
    res.json(GetAssistantProfileResponse.parse(profile));
  } catch (error) {
    handleError(res, error);
  }
});

router.patch("/assistant/profile", async (req, res) => {
  try {
    const body = UpdateAssistantProfileBody.parse(req.body ?? {});
    const { context, profile } = await getProfile(req);
    if (context.isPreview || !context.client) {
      res.json(GetAssistantProfileResponse.parse({ ...profile, ...{
        displayName: body.displayName ?? profile.displayName,
        preferredLanguage: body.preferredLanguage ?? profile.preferredLanguage,
        profession: body.profession ?? profile.profession,
        project: body.project ?? profile.project,
      }}));
      return;
    }
    const payload = {
      ...(body.displayName !== undefined ? { display_name: body.displayName } : {}),
      ...(body.preferredLanguage !== undefined ? { preferred_language: body.preferredLanguage } : {}),
      ...(body.profession !== undefined ? { profession: body.profession } : {}),
      ...(body.project !== undefined ? { project: body.project } : {}),
    };
    const { data, error } = await context.client
      .from("profiles")
      .update(payload)
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw error;
    res.json(GetAssistantProfileResponse.parse(mapProfile(data, context.userId, context.email)));
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/assistant/chats", async (req, res) => {
  try {
    const context = await getRequestContext(req);
    if (context.isPreview || !context.client) {
      res.json(ListAssistantChatsResponse.parse(previewChats));
      return;
    }
    const { data, error } = await context.client
      .from("chats")
      .select("id,title,updated_at,message_count")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(ListAssistantChatsResponse.parse((data ?? []).map(mapChat)));
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/assistant/chats", async (req, res) => {
  try {
    const body = CreateAssistantChatBody.parse(req.body ?? {});
    const context = await getRequestContext(req);
    if (context.isPreview || !context.client) {
      const chat = { id: `preview-${Date.now()}`, title: body.title ?? "New conversation", updatedAt: now(), messageCount: 0 };
      previewChats.unshift(chat);
      res.status(201).json(chat);
      return;
    }
    const { data, error } = await context.client
      .from("chats")
      .insert({ user_id: context.userId, title: body.title ?? "New conversation", message_count: 0 })
      .select("id,title,updated_at,message_count")
      .single();
    if (error) throw error;
    res.status(201).json(mapChat(data));
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/assistant/chats/:chatId/messages", async (req, res) => {
  try {
    const params = ListAssistantMessagesParams.parse(req.params);
    const context = await getRequestContext(req);
    if (context.isPreview || !context.client) {
      res.json(ListAssistantMessagesResponse.parse(previewMessages.filter((message) => message.chatId === params.chatId)));
      return;
    }
    const { data, error } = await context.client
      .from("messages")
      .select("id,chat_id,role,content,created_at")
      .eq("chat_id", params.chatId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json(ListAssistantMessagesResponse.parse((data ?? []).map(mapMessage)));
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/assistant/chats/:chatId/messages", async (req, res) => {
  try {
    const params = SendAssistantMessageParams.parse(req.params);
    const body = SendAssistantMessageBody.parse(req.body);
    const context = await getRequestContext(req);
    const createdAt = now();
    if (context.isPreview || !context.client) {
      const userMessage: Message = { id: `preview-user-${Date.now()}`, chatId: params.chatId, role: "user", content: body.content, createdAt };
      const assistantMessage: Message = {
        id: `preview-assistant-${Date.now()}`,
        chatId: params.chatId,
        role: "assistant",
        content: "Preview mode is active. Add your Supabase and Gemini credentials to receive live, private answers.",
        createdAt: now(),
      };
      previewMessages.push(userMessage, assistantMessage);
      res.json(assistantMessage);
      return;
    }

    const { error: userInsertError } = await context.client.from("messages").insert({
      chat_id: params.chatId,
      user_id: context.userId,
      role: "user",
      content: body.content,
    });
    if (userInsertError) throw userInsertError;

    const [{ profile }, memoryResult, historyResult] = await Promise.all([
      getProfile(req),
      context.client.from("memory_notes").select("category,title,content").eq("user_id", context.userId).order("updated_at", { ascending: false }).limit(30),
      context.client.from("messages").select("role,content").eq("chat_id", params.chatId).eq("user_id", context.userId).order("created_at", { ascending: true }).limit(30),
    ]);
    if (memoryResult.error) throw memoryResult.error;
    if (historyResult.error) throw historyResult.error;

    const systemInstruction = [
      "You are Narender AI, a private personal assistant for the authenticated user.",
      `User Profile: ${JSON.stringify(profile)}`,
      `Personal Knowledge Base: ${JSON.stringify(memoryResult.data ?? [])}`,
      "Use the profile and knowledge base only when relevant. Be concise, practical, and preserve the user's preferred language when appropriate.",
    ].join("\n");
    const apiKey = process.env.GEMINI_API_KEY;
    let answer = "Gemini is not configured yet. Add GEMINI_API_KEY to enable model responses.";
    if (apiKey) {
      const gemini = new GoogleGenerativeAI(apiKey);
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction });
      const chat = model.startChat({
        history: (historyResult.data ?? []).map((message) => ({
          role: message.role === "user" ? "user" : "model",
          parts: [{ text: String(message.content) }],
        })),
      });
      const result = await chat.sendMessage(body.content);
      answer = result.response.text();
    }

    const { data, error } = await context.client.from("messages").insert({
      chat_id: params.chatId,
      user_id: context.userId,
      role: "assistant",
      content: answer,
    }).select("id,chat_id,role,content,created_at").single();
    if (error) throw error;
    await context.client.from("chats").update({ updated_at: now() }).eq("id", params.chatId).eq("user_id", context.userId);
    res.json(mapMessage(data));
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/assistant/memory", async (req, res) => {
  try {
    const context = await getRequestContext(req);
    if (context.isPreview || !context.client) {
      res.json(ListAssistantMemoryResponse.parse(previewMemory));
      return;
    }
    const { data, error } = await context.client
      .from("memory_notes")
      .select("id,category,title,content,updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(ListAssistantMemoryResponse.parse((data ?? []).map(mapMemory)));
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/assistant/memory", async (req, res) => {
  try {
    const body = CreateAssistantMemoryBody.parse(req.body);
    const context = await getRequestContext(req);
    if (context.isPreview || !context.client) {
      const item = { id: `preview-memory-${Date.now()}`, ...body, updatedAt: now() };
      previewMemory.unshift(item);
      res.status(201).json(item);
      return;
    }
    const { data, error } = await context.client
      .from("memory_notes")
      .insert({ user_id: context.userId, category: body.category, title: body.title, content: body.content })
      .select("id,category,title,content,updated_at")
      .single();
    if (error) throw error;
    res.status(201).json(mapMemory(data));
  } catch (error) {
    handleError(res, error);
  }
});

export default router;