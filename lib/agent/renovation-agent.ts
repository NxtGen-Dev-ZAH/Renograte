import { z } from "zod";
import { Agent, run, webSearchTool, getLogger, handoff } from "@openai/agents";
import * as dotenv from 'dotenv';
import { EventEmitter } from 'events';

dotenv.config();

const logger = getLogger('property-search-app');


// Event emitter for agent handoffs
export const agentEventEmitter = new EventEmitter();

// Property details interface for user input
export interface PropertyDetailsInput {
  square_footage?: number;
  bedrooms?: number;
  bathrooms?: number;
}

// Extended schema for handoff events
export const handoffEventSchema = z.object({
  event_type: z.literal("require_property_details"),
  address: z.string().describe("The address that triggered the handoff"),
  reason: z.string().describe("Why property details are needed"),
  default_assumptions: z.object({
    square_footage: z.number().describe("Default assumed square footage"),
    bedrooms: z.number().describe("Default assumed bedrooms"), 
    bathrooms: z.number().describe("Default assumed bathrooms")
  })
});

export const renovationAgentSchema = z.object({
address: z.string().describe("Full property address"),
streetNumber: z.string().nullable().describe("Street number"),
streetName: z.string().nullable().describe("Street name"),
city: z.string().describe("City name"),
state: z.string().describe("State or province"),
postalCode: z.string().describe("ZIP or postal code"),
latitude: z.number().nullable().describe("Geographic latitude"),
longitude: z.number().nullable().describe("Geographic longitude"),
propertyType: z.string().nullable().describe("Type of property (e.g., Single Family, Condo)"),
bedrooms: z.number().nullable().describe("Number of bedrooms"),
bathrooms: z.number().nullable().describe("Number of bathrooms"),
livingArea: z.number().nullable().describe("Square footage of living area"),
lotSize: z.number().nullable().describe("Lot size in acres"),
yearBuilt: z.number().nullable().describe("Year the property was built"),
currentValue: z.number().nullable().describe("Current estimated or listing value"),
sites: z.array(z.string()).nullable().describe("Sites where the property data is found by the agent"),

});

export const neighbouringPropertiesAgentSchema = z.object({
  neighbouringProperties: z.array(
    z.object({
      address: z.string().describe("Full property address"),
      streetNumber: z.string().nullable().describe("Street number"),
      streetName: z.string().nullable().describe("Street name"),
      city: z.string().describe("City name"),
      state: z.string().describe("State or province"),
      postalCode: z.string().describe("ZIP or postal code"),
      latitude: z.number().nullable().describe("Geographic latitude"),
      longitude: z.number().nullable().describe("Geographic longitude"),
      propertyType: z.string().nullable().describe("Type of property (e.g., Single Family, Condo)"),
      bedrooms: z.number().nullable().describe("Number of bedrooms"),
      bathrooms: z.number().nullable().describe("Number of bathrooms"),
      livingArea: z.number().nullable().describe("Square footage of living area"),
      lotSize: z.number().nullable().describe("Lot size in acres"),
      yearBuilt: z.number().nullable().describe("Year the property was built"),
      currentValue: z.number().nullable().describe("Current estimated or listing value"),
      sites: z.array(z.string()).nullable().describe("Sites where the property data is found by the agent"),
    })
  ).describe("List of properties located near the given base address"),
});


export const NeighbouringPropertiesAgent = new Agent({
    name: "NeighbouringPropertiesAgent",
    instructions: `
    You are a Property Search Expert.
    1. Conduct an online search across multiple real estate platforms (e.g., Zillow, Redfin, Realtor, Trulia, VarietyHomes, etc.) to gather information on 5–10 properties located near the given address.
    2. Always ensure you return results in a well-structured format, including key property details.
    3. Focus on finding comparable properties that can be used for matching with user-provided property characteristics.`,
  outputType: neighbouringPropertiesAgentSchema,
  model: "gpt-4o-mini",
  tools: [webSearchTool()],
});

export const SpecificPropertyAgent = new Agent({
  name: "SpecificPropertyAgent",
  instructions: `
You are a property search expert tasked with finding ALL possible details for the EXACT property at the given address.

Steps:
1. Search across multiple trusted sources:
   - Zillow, Redfin, Realtor, Trulia, Homes.com
   - Public property records, tax databases, sales history
2. Use multiple search variations (different address spellings).
3. If you find partial details (e.g., only bedrooms or only tax record), include them but do not leave fields blank if you can infer them.
4. Always structure the output strictly according to the renovationAgentSchema.
5. If nothing is found, return all fields as null but still follow schema format.
`,
model: "gpt-4o-mini",
  outputType: renovationAgentSchema,
  tools: [webSearchTool()],

});

/**
 * SDK-Native Handoff Configurations
 * Using the OpenAI Agents SDK handoff() function with onHandoff callbacks
 * This replaces the manual event emission approach with proper SDK integration
 */

// Create handoff configuration for specific property analysis
const specificPropertyHandoff = handoff(SpecificPropertyAgent, {
  inputType: z.object({
    address: z.string().describe("Full property address to analyze")
  }),
  onHandoff: (ctx) => {
    logger.debug('SDK Handoff: SpecificPropertyAgent initiated for full address analysis');
    // This handoff processes complete addresses and doesn't require user input
  },
  toolNameOverride: 'handoff_to_specific_property',
  toolDescriptionOverride: 'Handoff to SpecificPropertyAgent for complete address analysis'
});

// Store the current address being processed for handoff context
// This is needed because the onHandoff callback doesn't provide direct access to the input
let currentProcessingAddress = '';

// Create handoff configuration for neighboring properties analysis (requires user input)
const neighbouringPropertiesHandoff = handoff(NeighbouringPropertiesAgent, {
  inputType: z.object({
    address: z.string().describe("Partial address, neighborhood, or street name to analyze")
  }),
  onHandoff: (ctx) => {
    logger.debug('SDK Handoff: NeighbouringPropertiesAgent initiated - requires user input for property matching');
    
    // Emit handoff event to trigger non-blocking user input collection
    // This event will be caught by the UI to show the property details form
    const handoffEvent = {
      event_type: "require_property_details" as const,
      address: currentProcessingAddress,
      reason: "Property not found as specific address. Need property details to find appropriate renovation allowance.",
      default_assumptions: {
        square_footage: 2000,
        bedrooms: 3,
        bathrooms: 2
      }
    };
    
    agentEventEmitter.emit('handoff', handoffEvent);
    logger.debug('SDK Handoff: Event emitted for user input collection', handoffEvent);
  },
  toolNameOverride: 'handoff_to_neighbouring_properties',
  toolDescriptionOverride: 'Handoff to NeighbouringPropertiesAgent for neighborhood analysis with user property details'
});

export const renograteAgent = new Agent({
  name: "RenograteAgent",
  instructions: `
  You are a decision-making agent that determines which specialized agent should handle the query.

Decision Rules:
1. If the input contains a **full address with a house/building number and complete address details** 
   (e.g., "2554 Druid Park Dr, Baltimore, MD 21215"), then use handoff_to_specific_property.
2. If the input contains only a **partial address, street name, city, or neighborhood** without full address details
   (e.g., "Druid Park Dr, Baltimore", "Main Street area"), then use handoff_to_neighbouring_properties.
   
3. Never guess. If unsure, search on internet using the provided tool to determine address completeness .
  `,
  model: "gpt-4o-mini",
  tools: [webSearchTool()],
  handoffs: [specificPropertyHandoff, neighbouringPropertiesHandoff],
});

// Enhanced run function with SDK-native handoff event handling
export async function runRenograteAgentWithEvents(address: string): Promise<{
  result: any;
  handoffEvent?: z.infer<typeof handoffEventSchema>;
}> {
  let handoffEvent: z.infer<typeof handoffEventSchema> | undefined;
  
  // Listen for handoff events emitted by the onHandoff callbacks
  const eventPromise = new Promise<z.infer<typeof handoffEventSchema> | undefined>((resolve) => {
    const timeout = setTimeout(() => {
      logger.debug('Handoff event timeout reached - no handoff occurred');
      resolve(undefined);
    }, 10000); // Increased timeout to 10 seconds for agent processing
    
    agentEventEmitter.once('handoff', (event) => {
      logger.debug('Handoff event received via SDK callback', event);
      clearTimeout(timeout);
      resolve(event);
    });
  });
  
  try {
    logger.debug(`Running RenograteAgent with address: ${address}`);
    
    // Store the current address for handoff context
    currentProcessingAddress = address;
    
    // Start the agent run and event listening simultaneously
    const [result] = await Promise.all([
      run(renograteAgent, address).catch(error => {
        logger.error('Agent run failed:', error);
        // Return a structured error result instead of throwing
        return {
          error: true,
          message: error.message || 'Agent execution failed',
          state: {
            _currentStep: {
              type: "error",
              output: JSON.stringify({
                error: "Agent execution failed",
                message: error.message || "Unknown error occurred"
              })
            }
          }
        };
      }),
      eventPromise.then(event => handoffEvent = event)
    ]);
    
    logger.debug('RenograteAgent completed successfully', {
      hasHandoffEvent: !!handoffEvent,
      handoffEventType: handoffEvent?.event_type,
      resultType: result?.state?._currentStep?.type
    });
    
    return {
      result,
      handoffEvent
    };
  } catch (error) {
    logger.error('Error running RenograteAgent with events:', error);
    
    // Return a structured error instead of throwing
    return {
      result: {
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        state: {
          _currentStep: {
            type: "error",
            output: JSON.stringify({
              error: "Agent execution failed",
              message: error instanceof Error ? error.message : "Unknown error occurred"
            })
          }
        }
      },
      handoffEvent
    };
  } finally {
    // Clean up the stored address
    currentProcessingAddress = '';
  }
}

// Function to find matching properties based on user input with enhanced matching algorithm
export async function findMatchingProperties(
  neighbouringProperties: any[], 
  userDetails: PropertyDetailsInput
): Promise<any[]> {
  if (!neighbouringProperties || neighbouringProperties.length === 0) {
    return [];
  }

  const targetSqft = userDetails.square_footage || 2000;
  const targetBedrooms = userDetails.bedrooms || 3;
  const targetBathrooms = userDetails.bathrooms || 2;

  // console.log(`Finding matches for: ${targetSqft} sqft, ${targetBedrooms} BR, ${targetBathrooms} BA`);

  // Score each property based on similarity with enhanced weighting
  const scoredProperties = neighbouringProperties.map(property => {
    let score = 0;
    let factors = 0;
    let exactMatches = 0;
    let closeMatches = 0;

    // Square footage similarity (most important)
    if (property.livingArea && targetSqft) {
      const sqftDiff = Math.abs(property.livingArea - targetSqft) / targetSqft;
      
      // Exact match bonus (within 5% of target)
      if (sqftDiff <= 0.05) {
        score += 5; // Strong bonus for very close square footage
        exactMatches++;
      } else if (sqftDiff <= 0.15) {
        score += 3; // Good bonus for reasonably close square footage
        closeMatches++;
      } else {
        score += Math.max(0, 1 - sqftDiff) * 3; // Graduated score for others
      }
      factors += 3;
      
      // console.log(`Property ${property.address}: sqft=${property.livingArea}, diff=${sqftDiff.toFixed(2)}`);
    }

    // Bedroom similarity - exact matches are critical
    if (property.bedrooms && targetBedrooms) {
      if (property.bedrooms === targetBedrooms) {
        score += 4; // Strong bonus for exact bedroom match
        exactMatches++;
      } else {
        const bedroomDiff = Math.abs(property.bedrooms - targetBedrooms);
        if (bedroomDiff === 1) {
          score += 2; // Still good if off by just 1 bedroom
          closeMatches++;
        } else {
          score += Math.max(0, 1 - (bedroomDiff * 0.5)) * 2;
        }
      }
      factors += 3; // Increased from 2
      
      // console.log(`Property ${property.address}: bedrooms=${property.bedrooms}, target=${targetBedrooms}`);
    }

    // Bathroom similarity - exact matches are important
    if (property.bathrooms && targetBathrooms) {
      if (property.bathrooms === targetBathrooms) {
        score += 3; // Strong bonus for exact bathroom match
        exactMatches++;
      } else {
        const bathroomDiff = Math.abs(property.bathrooms - targetBathrooms);
        if (bathroomDiff <= 0.5) {
          score += 1.5; // Good if off by just half bath
          closeMatches++;
        } else {
          score += Math.max(0, 1 - (bathroomDiff * 0.5)) * 1.5;
        }
      }
      factors += 2; // Increased from 1
      
      // console.log(`Property ${property.address}: bathrooms=${property.bathrooms}, target=${targetBathrooms}`);
    }

    // Bonus for properties that match multiple criteria exactly
    if (exactMatches >= 2) {
      score += 3; // Bonus for matching at least 2 criteria exactly
    } else if (exactMatches >= 1 && closeMatches >= 1) {
      score += 1.5; // Bonus for having some exact and close matches
    }

    const finalScore = factors > 0 ? score / factors : 0;
    
    // console.log(`Property ${property.address}: score=${finalScore.toFixed(2)}, exactMatches=${exactMatches}, closeMatches=${closeMatches}`);
    
    return {
      ...property,
      matchScore: finalScore,
      exactMatches,
      closeMatches
    };
  });

  // Sort by match score and return top matches
  const topMatches = scoredProperties
    .sort((a, b) => {
      // First prioritize properties with exact matches
      if (a.exactMatches !== b.exactMatches) {
        return b.exactMatches - a.exactMatches;
      }
      // Then by overall match score
      return b.matchScore - a.matchScore;
    })
    .slice(0, 5); // Return top 5 matches
    
  // console.log("Selected top matches:", topMatches.map(p => 
  //   `${p.address} (${p.livingArea}sqft, ${p.bedrooms}BR, ${p.bathrooms}BA) - Score: ${p.matchScore.toFixed(2)}`
  // ));
  
  return topMatches;
}

// Calculate CHV from matching properties with direct match prioritization
export function calculateCHVFromMatches(matchingProperties: any[], userAddress?: string): number {
  if (!matchingProperties || matchingProperties.length === 0) {
    return 0;
  }

  // Filter properties with valid prices
  const propertiesWithPrices = matchingProperties
    .filter(property => property.currentValue && property.currentValue > 0);

  if (propertiesWithPrices.length === 0) {
    return 0;
  }
  
  // Check if we have a perfect match (3 exact matches = all criteria matched)
  const perfectMatch = propertiesWithPrices.find(p => p.exactMatches === 3);
  if (perfectMatch) {
    // console.log(`PERFECT MATCH FOUND: ${perfectMatch.address} with ${perfectMatch.exactMatches} exact matches - Using direct CHV: $${perfectMatch.currentValue}`);
    return perfectMatch.currentValue;
  }
  
  // Check if any property is on the same street as the user's address
  // This is a strong indicator of relevance
  if (userAddress) {
    const streetName = extractStreetName(userAddress);
    if (streetName) {
      const sameStreetMatch = propertiesWithPrices.find(p => 
        p.exactMatches >= 2 && // Must have at least 2 exact matches (likely bedrooms and bathrooms)
        p.address && 
        p.address.toLowerCase().includes(streetName.toLowerCase())
      );
      
      if (sameStreetMatch) {
        // console.log(`SAME STREET MATCH FOUND: ${sameStreetMatch.address} on ${streetName} - Using direct CHV: $${sameStreetMatch.currentValue}`);
        return sameStreetMatch.currentValue;
      }
    }
  }

  // Otherwise, use weighted average based on match quality
  let totalWeightedPrice = 0;
  let totalWeight = 0;

  propertiesWithPrices.forEach(property => {
    // Calculate weight based on match score and exact matches
    let weight = property.matchScore || 1;
    
    // Boost weight for properties with exact matches
    if (property.exactMatches >= 2) {
      weight *= 2.5; // Higher weight for properties matching multiple criteria exactly
    } else if (property.exactMatches === 1) {
      weight *= 1.5; // 50% boost for one exact match
    }
    
    totalWeightedPrice += property.currentValue * weight;
    totalWeight += weight;
    
    // console.log(`CHV calculation: Property ${property.address} - Price: $${property.currentValue}, Weight: ${weight.toFixed(2)}`);
  });

  // Calculate weighted average
  const weightedAverage = totalWeight > 0 
    ? Math.round(totalWeightedPrice / totalWeight)
    : Math.round(propertiesWithPrices.reduce((sum, p) => sum + p.currentValue, 0) / propertiesWithPrices.length);
  
  // console.log(`No perfect match found - using weighted average CHV: $${weightedAverage}`);
  
  return weightedAverage;
}

// Helper function to extract street name from an address
function extractStreetName(address: string): string | null {
  // Basic extraction - looks for common street suffixes
  const streetSuffixes = ['rd', 'road', 'st', 'street', 'ave', 'avenue', 'blvd', 'boulevard', 'ln', 'lane', 'dr', 'drive', 'ct', 'court', 'pl', 'place', 'way'];
  
  // Convert to lowercase for easier matching
  const lowerAddress = address.toLowerCase();
  
  // Try to find street name using suffixes
  for (const suffix of streetSuffixes) {
    // Look for the suffix with a space before it
    const suffixIndex = lowerAddress.indexOf(` ${suffix}`);
    if (suffixIndex > 0) {
      // Find the start of the street name (after a number and space)
      const parts = lowerAddress.substring(0, suffixIndex).trim().split(' ');
      if (parts.length >= 2) {
        // Assume the first part is a number and the rest is the street name
        return parts.slice(1).join(' ') + ' ' + suffix;
      }
    }
  }
  
  // Alternative approach: split by commas and extract the first part
  const parts = address.split(',');
  if (parts.length > 0) {
    const firstPart = parts[0].trim();
    // Remove any numbers at the beginning
    const streetNameMatch = firstPart.match(/^\d+\s+(.+)$/);
    if (streetNameMatch && streetNameMatch[1]) {
      return streetNameMatch[1];
    }
  }
  
  return null;
}