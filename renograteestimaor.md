## **Renograte Estimator AI Agent **

### **Objective**

Build a Renovation Allowance Estimator where a user enters a **property address** in the input field, and the system (powered by OpenAI Agents + Realtyna API) searches online for detailed property information, calculates the **After Renovated Value (ARV)**, the **Current Home Value (CHV)**, and outputs a **Renovation Allowance** using the Renograte Formula:

$$
\text{Renovation Allowance} = (\text{ARV} \times 87\%) - \text{CHV}
$$

---

### **Flow Overview**

1. **User Input**

   * User enters a **property address** (string).

2. **AI Agent Internet Search**

   * AI agent (OpenAI Agent SDK) searches the internet for **detailed property data**.
   * Extracts as many fields as possible (size, lot size, bedrooms, bathrooms, year built, property type, recent sale price, estimated value, etc.).
   * The extracted data is validated and stored in a **Pydantic model**.

3. **If Data Found**

   * **ARV Calculation**:

     * Use Realtyna API to search **similar properties** within a radius of **1–6 miles**.
     * Filter results:

       * ±10–15% size difference
       * Same property type
       * Bedroom/Bathroom count within ±1 difference
     * Sort by **recent sale date** and take the **top 3 highest priced comparable renovated homes**.
     * Compute the **average price** of these top 3 → **ARV**.
   * **CHV Calculation**:
     * CHV could be listing price of the home, Either Find on the internet or Use Realtyna API to search for similar **properties** to find average current sale values of the home within 1-2 miles.
   * **Renovation Allowance**:

     $$
     (\text{ARV} \times 0.87) - \text{CHV}
     $$
   * Display results with breakdown.

4. **If Data NOT Found by AI Agent over the internet**

* **Step 1 – Extract basic geographic data** from the entered address:

  * Street Number
  * City
  * State
  * Postal Code

* **Step 2 – Ask the user directly** for key missing details:

  * Number of bedrooms
  * Number of bathrooms
  * Approximate living area size (sq ft or m²)

* **Step 3 – Pass the collected geographic data + user-provided property details** to the Realtyna API to find properties in that **specific area** matching:

  * ±10–15% size difference (based on the user-provided size)
  * ±1 bedroom difference
  * ±1 bathroom difference

5. **Final Output**

   * Show:

     * **ARV**
     * **CHV**
     * **Renovation Allowance**
     * Link to **Contact a Renograte Agent**
     * Option to **Email Renograte** to capture lead


### **Example Calculation**

If:

* ARV = \$1,000,000 (average of top 3 renovated homes)
* CHV = \$800,000 (current average home value for similar properties or listed value )
* Formula:

$$
(1,000,000 \times 0.87) - 800,000 = 70,000
$$

