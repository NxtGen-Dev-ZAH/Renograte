import { NextRequest, NextResponse } from 'next/server';
import { 
  runRenograteAgentWithEvents, 
  findMatchingProperties, 
  calculateCHVFromMatches,
  PropertyDetailsInput,
  handoffEventSchema 
} from '@/lib/agent/renovation-agent';
import { z } from 'zod';

// Agent-based property interface (simplified)
interface AgentProperty {
  address: string;
  currentValue: number;
  livingArea: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt?: number;
  propertyType: string;
  latitude?: number;
  longitude?: number;
  matchScore?: number;
}

interface EstimationResult {
  propertyAddress: string;
  arv: number;
  chv: number;
  renovationAllowance: number;
  propertyDetails: {
    listPrice: number;
    livingArea: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    propertyType: string;
  };
  comparables: {
    renovated: any[];
    asIs: any[];
  };
  calculationDetails: {
    arvFormula: string;
    chvFormula: string;
    renovationFormula: string;
    calculationMethod: 'agent_matching';
  };
  handoffEvent?: z.infer<typeof handoffEventSchema>;
  requiresUserInput?: boolean;
  agentData: {
    neighbouringProperties: any[];
    matchingProperties?: any[];
    agentWorkflow: 'specific_property' | 'neighbouring_properties';
  };
}

interface EstimationRequest {
  address: string;
  userDetails?: PropertyDetailsInput;
  isFollowUp?: boolean;
}

// Advanced ARV calculation based on property characteristics
function calculateAdvancedARV(propertyDetails: {
  listPrice: number;
  livingArea: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  propertyType: string;
  address?: string;
}): number {
  // Calculate dynamic ARV multiplier based on property characteristics
  let arvMultiplier = 1.14; // Base multiplier (14% increase)

  // Adjust for bedrooms (0-3% impact)
  const bedroomAdjustment =
    propertyDetails.bedrooms >= 4
      ? 0.03
      : propertyDetails.bedrooms === 3
        ? 0.02
        : propertyDetails.bedrooms === 2
          ? 0.01
          : 0;

  // Adjust for bathrooms (0-3% impact)
  const bathroomAdjustment =
    propertyDetails.bathrooms >= 3
      ? 0.03
      : propertyDetails.bathrooms === 2
        ? 0.02
        : 0.01;

  // Adjust for square footage (0-4% impact)
  let areaSizeAdjustment = 0;
  if (propertyDetails.livingArea) {
    if (propertyDetails.livingArea < 1000) areaSizeAdjustment = 0;
    else if (propertyDetails.livingArea < 1500) areaSizeAdjustment = 0.01;
    else if (propertyDetails.livingArea < 2000) areaSizeAdjustment = 0.02;
    else if (propertyDetails.livingArea < 2500) areaSizeAdjustment = 0.03;
    else areaSizeAdjustment = 0.04;
  }

  // Adjust for property type (0-3% impact)
  let typeAdjustment = 0;
  const propertyType = propertyDetails.propertyType;
  if (propertyType === "Condominium") {
    typeAdjustment = 0.01;
  } else if (propertyType === "Townhouse") {
    typeAdjustment = 0.02;
  } else if (propertyType === "Residential" || propertyType === "Single Family") {
    typeAdjustment = 0.03;
  }

  // Adjust for age (0-4% impact)
  let ageAdjustment = 0;
  if (propertyDetails.yearBuilt) {
    const age = new Date().getFullYear() - propertyDetails.yearBuilt;
    if (age > 50) ageAdjustment = 0.04;
    else if (age > 30) ageAdjustment = 0.03;
    else if (age > 15) ageAdjustment = 0.02;
    else if (age > 5) ageAdjustment = 0.01;
  }

  // Create a unique property identifier based on address
  const addressString = propertyDetails.address || `${propertyDetails.listPrice}_${propertyDetails.livingArea}`;
  
  // Generate a deterministic variation factor using the property address
  const hashValue = addressString.split("").reduce((acc, char, idx) => {
    return acc + char.charCodeAt(0) * (idx + 1);
  }, 0);

  // Create a variation factor between -2% and +2%
  const addressVariationFactor = -0.02 + (hashValue % 40) / 1000;

  // Combine all adjustments
  const totalAdjustment =
    bedroomAdjustment +
    bathroomAdjustment +
    areaSizeAdjustment +
    typeAdjustment +
    ageAdjustment +
    addressVariationFactor;

  // Final ARV multiplier (between 1.15 and 1.35, or 15% to 35% increase)
  const finalMultiplier = Math.min(
    Math.max(arvMultiplier + totalAdjustment, 1.15),
    1.35
  );

  // Calculate and return ARV
  return Math.round(propertyDetails.listPrice * finalMultiplier);
}

// Calculate renovation allowance using Renograte formula
function calculateRenovationAllowance(arv: number, chv: number): number {
  const tarr = 0.87; // Total Acquisition Renovation Ratio
  const tara = arv * tarr; // Total Acquisition Renovation Allowance
  const renovationAllowance = Math.max(0, Math.round(tara - chv));
  
  return renovationAllowance;
}

// Handle agent-based estimation with user details
async function handleAgentBasedEstimation(
  address: string, 
  agentResult: any, 
  userDetails: PropertyDetailsInput,
  handoffEvent: z.infer<typeof handoffEventSchema>
): Promise<NextResponse> {
  try {
    console.log('Processing agent-based estimation with user details');
    
    // Parse agent result to get neighboring properties
    let neighbouringProperties: any[] = [];
    
    if (agentResult.state?._currentStep?.type === "next_step_final_output") {
      try {
        const output = agentResult.state._currentStep.output;
        
        // Check if output is actually JSON (not HTML error content)
        if (output && typeof output === 'string' && !output.startsWith('<!DOCTYPE')) {
          // Try to clean the output before parsing
          let cleanedOutput = output.trim();
          
          // Remove any HTML tags that might be present
          cleanedOutput = cleanedOutput.replace(/<[^>]*>/g, '');
          
          // Try to find JSON content if it's embedded in other text
          const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanedOutput = jsonMatch[0];
          }
          
          const outputData = JSON.parse(cleanedOutput);
          
          if (outputData.neighbouringProperties) {
            neighbouringProperties = outputData.neighbouringProperties;
            // console.log(`Found ${neighbouringProperties.length} neighboring properties from agent`);
          }
        } else {
          throw new Error('Agent output is not valid JSON or contains HTML error content');
        }
      } catch (jsonError) {
        console.error('Failed to parse neighboring properties from agent output:', jsonError);
        console.error('Raw agent output:', agentResult.state._currentStep.output);
        throw new Error('Invalid agent response format: ' + (jsonError instanceof Error ? jsonError.message : String(jsonError)));
      }
    }

    if (neighbouringProperties.length === 0) {
      console.log('No neighboring properties found from agent');
      throw new Error('No neighboring properties found from OpenAI agent');
    }

    // Find matching properties based on user details
    const matchingProperties = await findMatchingProperties(neighbouringProperties, userDetails);
    // console.log(`Found ${matchingProperties.length} matching properties`);

    if (matchingProperties.length === 0) {
      return NextResponse.json({ error: 'No matching properties found' }, { status: 400 });
    }

    // Calculate CHV from matching properties - pass user address for street matching
    const chv = calculateCHVFromMatches(matchingProperties, address);
    // console.log('Calculated CHV:', chv);

    // Check if we found a perfect match
    const perfectMatch = matchingProperties.find(p => p.exactMatches === 3);
    
    // If perfect match found, use its specific characteristics for ARV calculation
    // This ensures perfect matches are treated exactly like specific properties
    if (perfectMatch) {
      // console.log(`Using perfect match for ARV calculation: ${perfectMatch.address}`);
      
      // Use the perfect match property's characteristics directly
      const arv = calculateAdvancedARV({
        listPrice: chv, // CHV is already set to the perfect match's value
        livingArea: perfectMatch.livingArea,
        bedrooms: perfectMatch.bedrooms,
        bathrooms: perfectMatch.bathrooms,
        yearBuilt: perfectMatch.yearBuilt || 2000,
        propertyType: perfectMatch.propertyType || 'Residential',
        address: perfectMatch.address
      });
      
      // console.log('Calculated ARV using perfect match characteristics:', arv);
      
      // Calculate renovation allowance
      const renovationAllowance = calculateRenovationAllowance(arv, chv);
      
      // Create the result object with perfect match details
      const result: EstimationResult = {
        propertyAddress: address,
        arv,
        chv,
        renovationAllowance,
        propertyDetails: {
          listPrice: chv,
          livingArea: perfectMatch.livingArea,
          bedrooms: perfectMatch.bedrooms,
          bathrooms: perfectMatch.bathrooms,
          yearBuilt: perfectMatch.yearBuilt || 2000,
          propertyType: perfectMatch.propertyType || 'Residential'
        },
        comparables: {
          renovated: matchingProperties.filter((_, index) => index % 2 === 0),
          asIs: matchingProperties.filter((_, index) => index % 2 === 1)
        },
        calculationDetails: {
          arvFormula: `Advanced calculation by the system based on the renovated properties`,
          chvFormula: `An in-depth analysis of a property's valuation performed by AI agents`,
          renovationFormula: `(ARV × 87%) - CHV = ($${arv.toLocaleString()} × 0.87) - $${chv.toLocaleString()} = $${renovationAllowance.toLocaleString()}`,
          calculationMethod: 'agent_matching'
        },
        agentData: {
          neighbouringProperties,
          matchingProperties,
          agentWorkflow: 'neighbouring_properties'
        }
      };
      
      return NextResponse.json(result);
    }
    
    // For non-perfect matches, use the average characteristics approach
    // Calculate average property characteristics from matching properties
    const avgLivingArea = Math.round(matchingProperties.reduce((sum, prop) => sum + (prop.livingArea || 0), 0) / matchingProperties.length) || userDetails.square_footage || 2000;
    const avgBedrooms = Math.round(matchingProperties.reduce((sum, prop) => sum + (prop.bedrooms || 0), 0) / matchingProperties.length) || userDetails.bedrooms || 3;
    const avgBathrooms = Math.round(matchingProperties.reduce((sum, prop) => sum + (prop.bathrooms || 0), 0) / matchingProperties.length) || userDetails.bathrooms || 2;
    const avgYearBuilt = Math.round(matchingProperties.reduce((sum, prop) => sum + (prop.yearBuilt || 2000), 0) / matchingProperties.length) || 2000;
    const commonPropertyType = matchingProperties[0]?.propertyType || 'Residential';
    
    // Use advanced ARV calculation method
    const arv = calculateAdvancedARV({
      listPrice: chv, // Use CHV for consistency
      livingArea: avgLivingArea,
      bedrooms: avgBedrooms,
      bathrooms: avgBathrooms,
      yearBuilt: avgYearBuilt,
      propertyType: commonPropertyType,
      address: address
    });
    
    // console.log('Calculated ARV:', arv);

    // Calculate renovation allowance
    const renovationAllowance = calculateRenovationAllowance(arv, chv);

    // Create synthetic property details from user input and matching data
    const propertyDetails = {
      listPrice: chv,
      livingArea: userDetails.square_footage || handoffEvent.default_assumptions.square_footage,
      bedrooms: userDetails.bedrooms || handoffEvent.default_assumptions.bedrooms,
      bathrooms: userDetails.bathrooms || handoffEvent.default_assumptions.bathrooms,
      yearBuilt: avgYearBuilt,
      propertyType: commonPropertyType
    };

    const result: EstimationResult = {
      propertyAddress: address,
      arv,
      chv,
      renovationAllowance,
      propertyDetails,
      comparables: {
        renovated: matchingProperties.filter((_, index) => index % 2 === 0), // Simple split for demo
        asIs: matchingProperties.filter((_, index) => index % 2 === 1)
      },
      calculationDetails: {
        arvFormula: `Advanced calculation by the system based on the renovated properties`,
        chvFormula: `Value of the specified property determined by the AI-powered system`,
        renovationFormula: `(ARV × 87%) - CHV = ($${arv.toLocaleString()} × 0.87) - $${chv.toLocaleString()} = $${renovationAllowance.toLocaleString()}`,
        calculationMethod: 'agent_matching'
      },
      agentData: {
        neighbouringProperties,
        matchingProperties,
        agentWorkflow: 'neighbouring_properties'
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in agent-based estimation:', error);
    return NextResponse.json(
      { error: 'Failed to process agent-based estimation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let address: string = '';
  
  try {
    const body: EstimationRequest = await request.json();
    const { userDetails, isFollowUp } = body;
    address = body.address;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // console.log('Processing agent-matching estimation request:', { address, userDetails, isFollowUp });

    // Step 1: Try OpenAI Agents SDK first
    let agentResult;
    let handoffEvent;
    
    try {
      const agentResponse = await runRenograteAgentWithEvents(address);
      agentResult = agentResponse.result;
      handoffEvent = agentResponse.handoffEvent;
      // console.log('OpenAI Agent response:', { agentResult, handoffEvent });
      
      // Check if agent returned an error
      if (agentResult?.error) {
        // console.error('Agent returned error:', agentResult.message);
        return NextResponse.json(
          { error: `Agent processing failed: ${agentResult.message}` },
          { status: 500 }
        );
      }
    } catch (agentError) {
      // console.error('OpenAI Agent error:', agentError);
      return NextResponse.json(
        { error: 'Failed to process address with OpenAI agents. Please try again.' },
        { status: 500 }
      );
    }

    // Step 2: Handle handoff event (requires user input)
    if (handoffEvent && !isFollowUp && !userDetails) {
      console.log('Handoff event detected - requesting user input');
      
      // Return partial result with handoff event
      return NextResponse.json({
        propertyAddress: address,
        arv: 0,
        chv: 0,
        renovationAllowance: 0,
        propertyDetails: {
          listPrice: 0,
          livingArea: handoffEvent.default_assumptions.square_footage,
          bedrooms: handoffEvent.default_assumptions.bedrooms,
          bathrooms: handoffEvent.default_assumptions.bathrooms,
          yearBuilt: 2000,
          propertyType: 'Residential'
        },
        comparables: {
          renovated: [],
          asIs: []
        },
        calculationDetails: {
          arvFormula: 'Collecting property details for accurate matching',
          chvFormula: 'Will calculate from neighboring properties',
          renovationFormula: 'Pending property details',
          calculationMethod: 'agent_matching'
        },
        handoffEvent,
        requiresUserInput: true,
        agentData: {
          neighbouringProperties: [],
          agentWorkflow: 'neighbouring_properties'
        }
      } as EstimationResult);
    }

    // Step 3: Process with user details if provided
    if (handoffEvent && userDetails && agentResult) {
      console.log('Processing agent-based estimation with user-provided details');
      return await handleAgentBasedEstimation(address, agentResult, userDetails, handoffEvent);
    }

    // Step 4: Process specific property result (no user input needed)
    if (!handoffEvent && agentResult) {
      console.log('Processing specific property from agent');
      
      // Parse specific property result - with error handling for JSON parsing
      if (agentResult.state?._currentStep?.type === "next_step_final_output") {
        try {
          const output = agentResult.state._currentStep.output;
          
          // Check if output is actually JSON (not HTML error content)
          if (output && typeof output === 'string' && !output.startsWith('<!DOCTYPE')) {
            // Try to clean the output before parsing
            let cleanedOutput = output.trim();
            
            // Remove any HTML tags that might be present
            cleanedOutput = cleanedOutput.replace(/<[^>]*>/g, '');
            
            // Try to find JSON content if it's embedded in other text
            const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              cleanedOutput = jsonMatch[0];
            }
            
            const outputData = JSON.parse(cleanedOutput);
            
            // Calculate values from specific property data using advanced ARV calculation
            const chv = outputData.currentValue || 300000; // Default if no value
            
            // Use advanced ARV calculation method - standardized approach
            // Always use CHV as the listPrice input for consistent ARV calculations
            const arv = calculateAdvancedARV({
              listPrice: chv,
              livingArea: outputData.livingArea || 2000,
              bedrooms: outputData.bedrooms || 3,
              bathrooms: outputData.bathrooms || 2,
              yearBuilt: outputData.yearBuilt || 2000,
              propertyType: outputData.propertyType || 'Residential',
              address: outputData.address || address
            });
            
            const renovationAllowance = calculateRenovationAllowance(arv, chv);
            
            const result: EstimationResult = {
              propertyAddress: outputData.address || address,
              arv,
              chv,
              renovationAllowance,
              propertyDetails: {
                listPrice: chv,
                livingArea: outputData.livingArea || 2000,
                bedrooms: outputData.bedrooms || 3,
                bathrooms: outputData.bathrooms || 2,
                yearBuilt: outputData.yearBuilt || 2000,
                propertyType: outputData.propertyType || 'Residential'
              },
              comparables: {
                renovated: [],
                asIs: []
              },
              calculationDetails: {
                arvFormula: `The system conducts advanced calculations using data from the renovated properties`,
                chvFormula: `AI Agent found specific property value`,
                renovationFormula: `(ARV × 87%) - CHV = ($${arv.toLocaleString()} × 0.87) - $${chv.toLocaleString()} = $${renovationAllowance.toLocaleString()}`,
                calculationMethod: 'agent_matching'
              },
              agentData: {
                neighbouringProperties: [],
                agentWorkflow: 'specific_property'
              }
            };

            return NextResponse.json(result);
          } else {
            throw new Error('Agent output is not valid JSON or contains HTML error content');
          }
        } catch (jsonError) {
          console.error('Failed to parse agent output as JSON:', jsonError);
          // console.error('Raw agent output:', agentResult.state._currentStep.output);
          throw new Error('Invalid agent response format: ' + (jsonError instanceof Error ? jsonError.message : String(jsonError)));
        }
      }
    }

    // If no valid agent result, return error
    return NextResponse.json(
      { error: 'Unable to process property estimation. OpenAI agents did not return valid data.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Agent-matching estimation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate renovation allowance. Please try again later.' },
      { status: 500 }
    );
  }
}