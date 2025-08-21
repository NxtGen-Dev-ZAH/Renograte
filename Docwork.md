## **Implementation Plan**

### **1. Install Dependencies**

```bash
npm install @openai/agents @openai/api zod axios
```

* `@openai/agents` → OpenAI Agents SDK
* `@openai/api` → Core OpenAI API SDK (needed for calling models if required separately)
* `zod` → Schema validation (can also be Pydantic equivalent for JS/TS)
* `axios` → API requests (for Realtyna, geocoding, etc.)

---

### **2. Define the Pydantic-like Model in TypeScript**

```ts
import { z } from "zod";

export const propertySchema = z.object({
  address: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  sizeSqFt: z.number().optional(),
  yearBuilt: z.number().optional(),
  propertyType: z.string().optional(),
  currentValue: z.number().optional(),
  afterRenovationValue: z.number().optional(),
});
```

* This schema will be **filled by the AI Agent** after searching the internet.
* Later, these fields are sent to Realtyna API for finding comps.

---

### **3. Create Tools for the Agent**

Tools are functions the agent can call. Examples:

```ts
import axios from "axios";

export const internetSearchTool = {
  name: "internetSearch",
  description: "Search the internet for detailed property information",
  parameters: z.object({
    address: z.string(),
  }),
  execute: async ({ address }) => {
    // Call Google API, Zillow, or any property search API
    const result = await axios.get(`https://custom-search.com?query=${address}`);
    return result.data;
  },
};

export const realtynaSearchTool = {
  name: "realtynaSearch",
  description: "Search Realtyna API for similar properties",
  parameters: z.object({
    city: z.string(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    sizeSqFt: z.number().optional(),
    radius: z.number().default(6),
  }),
  execute: async (params) => {
    const res = await axios.post("https://realtyna-api.com/search", params);
    return res.data;
  },
};
```

---

### **4. Define the Agent**

```ts
import { createAgent } from "@openai/agents";

export const renograteAgent = createAgent({
  name: "RenograteEstimator",
  instructions: `
    You are a property valuation and renovation allowance estimation expert.
    1. Use 'internetSearch' to gather property details.
    2. If internet search fails, request user for bedrooms, bathrooms, and size.
    3. Use 'realtynaSearch' to find comparable properties within given radius.
    4. Calculate ARV as the average of top 3 highest renovated comps.
    5. Calculate CHV from comps or listing price.
    6. Apply the formula: (ARV * 0.87) - CHV.
    7. Return ARV, CHV, and Renovation Allowance.
  `,
  tools: [internetSearchTool, realtynaSearchTool],
});
```

---

### **5. Create the API Route in Next.js**

```ts
// app/api/renograte/route.ts
import { NextResponse } from "next/server";
import { renograteAgent } from "@/lib/agents/renograte";

export async function POST(req: Request) {
  const { address } = await req.json();
  
  const response = await renograteAgent.run({
    input: `Estimate renovation allowance for: ${address}`,
  });

  return NextResponse.json(response.output);
}
```

---

### **6. Frontend Flow**

* User enters address → `/api/renograte` → Agent runs → Returns ARV, CHV, Renovation Allowance.
* If AI can’t find size/bedrooms/bathrooms → frontend prompts user to enter them → API is called again with new data.

---

### **7. How to Find Similar Closer Properties**

* Use **lat/lng** from Google Geocoding API for the input address.
* Pass coordinates to Realtyna API with:

  * **radius**: start at 1 mile, expand up to 6 miles if results are few.
  * **filters**:

    * size within ±10–15% of target size
    * bedrooms ±1
    * bathrooms ±1
* Sort results by **recently sold** and filter for **renovated homes** (if Realtyna supports renovation status).
* Pick **top 3 highest sale prices** → average them → ARV.
