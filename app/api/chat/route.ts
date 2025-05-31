import { NextRequest, NextResponse } from 'next/server';
import { createStreamableUI } from '../../../lib/streaming';
import { ChatOpenAI } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { LRUCache } from 'lru-cache';

// Rate limiting implementation
interface RateLimitInfo {
  count: number;
  firstRequest: number;
  lastRequest: number;
  burstCount: number;
  burstStart: number;
  hourlyCount: number;
  hourlyStart: number;
}

// Configure rate limits with tiered approach
const RATE_LIMIT_CONFIG = {
  standard: {
    maxRequests: 3,    // 3 requests
    window: 60 * 1000, // Per minute
    cooldown: 2 * 60 * 1000 // 2 minute cooldown
  },
  burst: {
    maxRequests: 3,    // 3 requests
    window: 8 * 1000, // Per 8 seconds
    cooldown: 45 * 1000 // 45 second cooldown   
  },
  sustained: {
    maxRequests: 10,    // 10 requests
    window: 60 * 60 * 1000, // Per hour
    cooldown: 30 * 60 * 1000 // 30 minute cooldown
  }
};

// Store rate limit information by IP
const rateLimitCache = new LRUCache<string, RateLimitInfo>({
  max: 500, // Maximum number of IPs to track
  ttl: RATE_LIMIT_CONFIG.sustained.cooldown, // Auto-expire entries after the longest cooldown
});

// Enhanced rate limit check that applies multiple tiers
function checkRateLimit(ip: string): { limited: boolean; resetTime?: number; reason?: string } {
  const now = Date.now();
  
  // Get or initialize rate limit info for this IP
  let limitInfo = rateLimitCache.get(ip);
  if (!limitInfo) {
    limitInfo = {
      count: 1,
      firstRequest: now,
      lastRequest: now,
      burstCount: 1,
      burstStart: now,
      hourlyCount: 1,
      hourlyStart: now
    };
    rateLimitCache.set(ip, limitInfo);
    return { limited: false };
  }
  
  // Update the current stats
  limitInfo.lastRequest = now;
  
  // Check burst limit (short-term high frequency)
  const timeSinceBurstStart = now - limitInfo.burstStart;
  if (timeSinceBurstStart > RATE_LIMIT_CONFIG.burst.window) {
    // Reset burst window
    limitInfo.burstCount = 1;
    limitInfo.burstStart = now;
  } else {
    limitInfo.burstCount++;
    // Check if burst limit exceeded
    if (limitInfo.burstCount > RATE_LIMIT_CONFIG.burst.maxRequests) {
      const resetTime = limitInfo.burstStart + RATE_LIMIT_CONFIG.burst.cooldown;
      rateLimitCache.set(ip, limitInfo);
      return { 
        limited: true, 
        resetTime,
        reason: 'Too many requests in a short period'
      };
    }
  }
  
  // Check standard limit (minute-by-minute)
  const timeSinceStart = now - limitInfo.firstRequest;
  if (timeSinceStart > RATE_LIMIT_CONFIG.standard.window) {
    // Reset standard window
    limitInfo.count = 1;
    limitInfo.firstRequest = now;
  } else {
    limitInfo.count++;
    // Check if standard limit exceeded
    if (limitInfo.count > RATE_LIMIT_CONFIG.standard.maxRequests) {
      const resetTime = limitInfo.firstRequest + RATE_LIMIT_CONFIG.standard.cooldown;
      rateLimitCache.set(ip, limitInfo);
      return { 
        limited: true, 
        resetTime,
        reason: 'Rate limit exceeded, please try again later'
      };
    }
  }
  
  // Check sustained/hourly limit
  const timeSinceHourlyStart = now - limitInfo.hourlyStart;
  if (timeSinceHourlyStart > RATE_LIMIT_CONFIG.sustained.window) {
    // Reset hourly window
    limitInfo.hourlyCount = 1;
    limitInfo.hourlyStart = now;
  } else {
    limitInfo.hourlyCount++;
    // Check if hourly limit exceeded
    if (limitInfo.hourlyCount > RATE_LIMIT_CONFIG.sustained.maxRequests) {
      const resetTime = limitInfo.hourlyStart + RATE_LIMIT_CONFIG.sustained.cooldown;
      rateLimitCache.set(ip, limitInfo);
      return { 
        limited: true, 
        resetTime,
        reason: 'Hourly limit reached, please try again later'
      };
    }
  }
  
  // Update the cache with the new counts
  rateLimitCache.set(ip, limitInfo);
  return { limited: false };
}

// Load Renograte information directly as a string
const RENOGRATE_DATA = `Renograte is a platform designed to integrate renovation opportunities directly into real estate transactions. It connects buyers, sellers, agents, and contractors to facilitate property improvements before closing, without upfront costs.

How Renograte Benefits Key Stakeholders
For Buyers: Allows for seamless purchase and renovation of a home before closing, enabling customization without the need for additional post-purchase financing.
For Sellers: Increases market appeal and potential sale price by leveraging untapped equity, eliminating the need for costly pre-sale renovations.
For Real Estate Agents: Enhances value propositions, generates more leads, and differentiates agents in a competitive market by offering an innovative solution.
For Contractors: Connects trusted professionals with steady renovation projects, ensuring payment at closing without requiring upfront deposits from buyers or sellers.
By streamlining this process, Renograte aims to create a mutually beneficial scenario with higher property values, reduced financial risk, and smoother transactions for all parties.

Features of the Renograte.com Platform
Renograte Calculator: An advanced tool to calculate renovation allowances based on After Renovated Value (ARV), current market values, and associated costs.
Renovation Allowance Listings (RAL): Features properties with detailed financial projections like current listing price, potential ARV, and suggested renovation allowance.
Market Analysis Tools: Provides comprehensive data and analytics for real estate decisions, including market trends and valuations.
Communication Hub: A centralized platform for all stakeholder communications, streamlining interactions.
ROI Calculator: Estimates potential returns on renovation investments.
Lead Generation: Uses advanced tools to capture and nurture qualified leads for real estate professionals.
Contractor Network: Offers access to a network of vetted contractors.
Term Sheet & Option Contract: Provides legally-vetted templates for renovation agreements and property options.
Client Communication: Integrates tools for managing project timelines, milestones, and automated updates.
Renograte University: A dedicated educational section with tutorials and resources for effective platform use.
Renograte Marketing: Supports agents and sellers with tailored marketing tools and strategies for renovation-ready properties.
Partnership Directory: Facilitates connections with industry partners, including financial institutions, renovation suppliers, and educational entities.
Renograte AI: Employs artificial intelligence for instant responses and support.

Additional Renograte Services
Renograte University: Offers educational resources and video tutorials for platform utilization.
Renograte Marketing: Provides tools and strategies to assist real estate agents in promoting Renograte-enabled listings.
Partnership Directory: A directory of partners including real estate agencies, contractors, and financial institutions.
Renograte AI: An AI-driven assistant for platform navigation, cost calculation, and query resolution.
Renograte Listing Platform: Allows realtors to create attractive listings with renovation allowances, manage buyer renovations, and connect with listing service providers.
Renograte Option-Based Agreement: Works with the Service Provider Agreement and Renograte Term Sheet to enable agents to create detailed renovation offers.

Why Choose Renograte?
Renograte is built on expertise in real estate, banking, and construction. The platform empowers agents to seamlessly integrate renovations into real estate transactions, eliminating upfront costs for buyers and sellers.`;

// Initialize the vector store and retriever - this happens once when the API route is first loaded
let vectorStore: MemoryVectorStore;
let retriever: ReturnType<MemoryVectorStore['asRetriever']>;
let initialized = false;
let initializing = false;

// Setup a response cache with LRU strategy
const responseCache = new LRUCache<string, string>({
  max: 100, // Store up to 100 query/response pairs
  ttl: 1000 * 60 * 60, // Cache for 1 hour
});

// Pre-compute common question categories for faster retrieval
const COMMON_TOPICS = [
  "buyers", "sellers", "agents", "contractors", "features", 
  "calculator", "listings", "services", "benefits", "renovations"
];

// Optimized chunk settings for better retrieval
const CHUNK_CONFIG = {
  chunkSize: 500,     // Larger chunks to reduce fragmentation
  chunkOverlap: 100,  // Higher overlap for better context preservation
  separators: ["\n\n", "\n", "## ", "# ", "### ", "- ", "**", "*", ":", "."],
};

async function initializeRetriever() {
  if (initialized) return true;
  if (initializing) {
    // Wait for initialization to complete if already in progress
    while (initializing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return initialized;
  }
  
  initializing = true;
  
  if (!process.env.OPENAI_API_KEY) {
    initializing = false;
    throw new Error("OPENAI_API_KEY is not set in the environment variables");
  }

  try {
    // Create a text splitter with optimized settings
    const textSplitter = new RecursiveCharacterTextSplitter(CHUNK_CONFIG);

    // Split Renograte data into chunks
    const renograteDocument = new Document({ pageContent: RENOGRATE_DATA });
    const docs = await textSplitter.splitDocuments([renograteDocument]);
    console.log(`Split Renograte data into ${docs.length} chunks`);

    // Use OpenAI embeddings with optimization
    const embeddings = new OpenAIEmbeddings({
      stripNewLines: true, // Remove newlines for better embedding quality
    });
    
    // Create a vector store from the documents
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    
    // Create a retriever with optimized settings
    retriever = vectorStore.asRetriever({
      searchType: "similarity",
      k: 4, // Retrieve more chunks for better context
      filter: undefined, // No filtering for this small dataset
    });

    // Pre-warm the cache with common queries
    await Promise.all(COMMON_TOPICS.map(async (topic) => {
      const query = `Tell me about Renograte's ${topic}`;
      // We don't need to store results here, just trigger the embeddings calculation
      await vectorStore.similaritySearch(query, 3);
    }));

    console.log("Retriever initialized successfully");
    initialized = true;
    initializing = false;
    return true;
  } catch (error) {
    console.error("Error initializing retriever:", error);
    initializing = false;
    throw error;
  }
}

// Define the system prompt for the chatbot
const SYSTEM_TEMPLATE = `You are a helpful, professional assistant for Renograte, a platform that integrates renovation opportunities into real estate transactions.
Your role is to provide information about Renograte's features, benefits, services, and how it helps buyers, sellers, agents, and contractors.
Be friendly, concise, and informative.

Use ONLY the following context to answer questions about Renograte:
{context}

If the question falls outside of information about Renograte contained in the context, politely explain that you can only provide information about Renograte's platform, services, and benefits.
Avoid making up information not present in the context.`;

// Initialize retriever when the API route module is loaded
initializeRetriever().catch(console.error);

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(ip);
    if (rateLimitResult.limited) {
      const resetTime = rateLimitResult.resetTime || Date.now() + RATE_LIMIT_CONFIG.standard.cooldown;
      const secondsToReset = Math.ceil((resetTime - Date.now()) / 1000);
      const reason = rateLimitResult.reason || 'Rate limit exceeded';
      
      return NextResponse.json({
        error: `${reason}. Please try again in ${secondsToReset} seconds.`
      }, {
        status: 429,
        headers: {
          'Retry-After': secondsToReset.toString(),
          'X-Rate-Limit-Reason': reason
        }
      });
    }
    
    // Make sure we have initialized the retriever successfully
    if (!initialized) {
      try {
        await initializeRetriever();
      } catch (error) {
        console.error("Error initializing retriever on demand:", error);
        // Fallback to basic response when retriever fails
        return NextResponse.json({ 
          error: "Service initialization failed. Please try again later." 
        }, { status: 503 });
      }
      
      // If still not initialized after attempt, return error
      if (!initialized || !retriever) {
        return NextResponse.json({ 
          error: "Service temporarily unavailable" 
        }, { status: 503 });
      }
    }

    // Parse the request
    const { query } = await req.json();

    // Ensure valid input
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    // Set up the streaming
    const { stream, writer } = createStreamableUI();

    // Process the query asynchronously
    (async () => {
      try {
        // Check if we already have a cached response
        const cachedResponse = responseCache.get(query.toLowerCase().trim());
        if (cachedResponse) {
          // Stream the cached response
          const words = cachedResponse.split(' ');
          for (const word of words) {
            writer.write(word + ' ');
            // Small delay to simulate streaming for cached responses
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          writer.close();
          return;
        }

        let fullResponse = '';
        
        // Create the model with optimized settings
        const model = new ChatOpenAI({
          modelName: "gpt-3.5-turbo", // Use standard model to avoid compatibility issues
          temperature: 0.2, // Lower temperature for more deterministic responses
          streaming: true,
          callbacks: [
            {
              handleLLMNewToken: (token: string) => {
                writer.write(token);
                fullResponse += token; // Collect response directly here
              },
            },
          ],
        });

        try {
          // Validate retriever is properly initialized
          if (!retriever) {
            throw new Error("Retriever is not initialized properly");
          }

          // Create a simpler prompt template for faster processing
          const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            ["human", "{input}"],
          ]);

          // Create the document chain
          const documentChain = await createStuffDocumentsChain({
            llm: model,
            prompt,
          });

          // Create the retrieval chain with optimized settings
          const retrievalChain = await createRetrievalChain({
            combineDocsChain: documentChain,
            retriever,
          });

          // Execute the chain
          await retrievalChain.invoke({
            input: query,
            chat_history: [], // No chat history for now for faster responses
          });

          // Cache the response for future use
          responseCache.set(query.toLowerCase().trim(), fullResponse);
        } catch (error) {
          console.error("Chain error:", error);
          
          // Fallback to direct response when chain fails
          const fallbackResponse = "I'm sorry, I'm having trouble retrieving information at the moment. Could you try a different question or try again later?";
          writer.write(fallbackResponse);
          
          // We don't cache error responses
        }

        // Close the writer when done
        writer.close();
      } catch (error) {
        console.error("Error in stream processing:", error);
        writer.write("\nSorry, I encountered an error while processing your request.");
        writer.close();
      }
    })();

    // Return the stream
    return new Response(stream);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 