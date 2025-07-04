import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  getUserProfileBySessionId,
  saveUserProfile,
  saveAnalyticsEvent,
  getBenefitsPlansByClientId,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { searchBenefitsContent, formatSearchResultsForPrompt } from '@/lib/azure-search';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';
import { z } from 'zod';

export const maxDuration = 60;

const BENEFITS_SYSTEM_PROMPT = `You are an expert benefits advisor helping employees understand their health insurance options.

Your expertise includes:
- Health insurance plan types (HMO, PPO, HDHP, EPO) and their key differences
- Cost analysis including premiums, deductibles, copays, and out-of-pocket maximums  
- Enrollment processes, eligibility requirements, and life event changes
- Provider networks, prescription coverage, and claims processes
- Personalized recommendations based on family size, medical needs, and budget

Available Benefits Information:
{SEARCH_RESULTS}

User Profile:
{USER_PROFILE}

Guidelines:
1. Ask targeted follow-up questions to understand user needs
2. Provide specific cost calculations when possible
3. Explain insurance concepts in simple terms
4. Recommend specific plans based on user situation
5. Always cite specific plan details when making recommendations
6. Offer to create personalized cost comparisons

Maintain a professional but friendly tone, and always prioritize the user's specific needs and budget constraints.`;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    // Add benefits intelligence
    const clientId = 'default-client'; // Get from user context or header
    const userProfile = await getUserProfileBySessionId(session.user.id);

    // Get last user message for search
    const lastUserMessage = message;
    let searchResults = [];
    try {
      searchResults = await searchBenefitsContent(
        lastUserMessage.parts.map(part => part.text).join(' '), 
        clientId
      );
    } catch (error) {
      console.log('Azure Search not configured, using benefits mode without search results');
    }

    // Enhance system prompt with search results and user profile
    const enhancedSystemPrompt = BENEFITS_SYSTEM_PROMPT
      .replace('{SEARCH_RESULTS}', formatSearchResultsForPrompt(searchResults))
      .replace('{USER_PROFILE}', JSON.stringify(userProfile || {}));

    // Track analytics event
    await saveAnalyticsEvent({
      sessionId: session.user.id,
      clientId,
      eventType: 'conversation_start',
      metadata: { messageCount: uiMessages.length }
    });

    console.log(JSON.stringify(uiMessages, null, 2));

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: enhancedSystemPrompt,
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'calculatePlanCosts',
                  'comparePlans',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            calculatePlanCosts: {
              description: 'Calculate annual costs for health insurance plans',
              parameters: z.object({
                planType: z.string(),
                familySize: z.number(),
                estimatedUsage: z.enum(['low', 'medium', 'high'])
              }),
              execute: async ({ planType, familySize, estimatedUsage }) => {
                // Get plan data from database
                const plans = await getBenefitsPlansByClientId(clientId);
                const selectedPlan = plans.find(p => p.type === planType);
                
                if (!selectedPlan) {
                  return { error: 'Plan not found' };
                }

                // Calculate costs based on family size
                const premiumKey = familySize === 1 ? 'individual' 
                  : familySize === 2 ? 'employeeSpouse'
                  : familySize >= 3 ? 'family' : 'individual';
                
                const annualPremiums = selectedPlan.monthlyPremium[premiumKey] * 12;
                const deductible = familySize === 1 
                  ? selectedPlan.deductible.individual 
                  : selectedPlan.deductible.family;
                
                // Estimate usage costs
                const usageMultiplier = estimatedUsage === 'low' ? 0.3 
                  : estimatedUsage === 'medium' ? 0.6 : 0.9;
                const estimatedUsageCosts = deductible * usageMultiplier;
                
                return {
                  planName: selectedPlan.name,
                  annualPremiums,
                  deductible,
                  estimatedUsageCosts,
                  totalEstimatedCost: annualPremiums + estimatedUsageCosts,
                  breakdown: {
                    monthlyPremium: selectedPlan.monthlyPremium[premiumKey],
                    copays: selectedPlan.copays,
                    prescriptionCoverage: selectedPlan.prescriptionCoverage
                  }
                };
              }
            },
            comparePlans: {
              description: 'Compare multiple health insurance plans',
              parameters: z.object({
                planIds: z.array(z.string()),
                userProfile: z.object({
                  familySize: z.number(),
                  medicalConditions: z.array(z.string())
                })
              }),
              execute: async ({ planIds, userProfile }) => {
                const plans = await getBenefitsPlansByClientId(clientId);
                const selectedPlans = plans.filter(p => planIds.includes(p.id));
                
                const comparison = selectedPlans.map(plan => {
                  const premiumKey = userProfile.familySize === 1 ? 'individual'
                    : userProfile.familySize === 2 ? 'employeeSpouse'
                    : 'family';
                  
                  return {
                    planName: plan.name,
                    type: plan.type,
                    monthlyPremium: plan.monthlyPremium[premiumKey],
                    annualPremium: plan.monthlyPremium[premiumKey] * 12,
                    deductible: userProfile.familySize === 1 
                      ? plan.deductible.individual 
                      : plan.deductible.family,
                    copays: plan.copays,
                    features: plan.features,
                    networkName: plan.networkName
                  };
                });
                
                await saveAnalyticsEvent({
                  sessionId: session.user.id,
                  clientId,
                  eventType: 'plan_compared',
                  metadata: { plansCompared: planIds, familySize: userProfile.familySize }
                });
                
                return { comparison, totalPlans: comparison.length };
              }
            },
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: (error) => {
        console.log(error);
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream);
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
