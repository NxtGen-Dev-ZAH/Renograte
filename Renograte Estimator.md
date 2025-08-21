The workflow starts when the user enters a **property address**.

1. **Property Lookup Agent**

   * The first agent RenograteAgent  decides whether to send the query to the SpecificPropertyAgent or the NeighbouringPropertiesAgent depending on whether the user gives a full address or just a street/neighborhood.
   * If the entered address is relating to a specific property, then handsoff the working to the **SpecificPropertyAgent** otherwise to the neighbouringPropertyAgent

2. **NeighbouringPropertyAgent (if no property is found)**
   * This agent retrieves details of **nearby properties** based on the entered address.


I want you to implement the below workflow where The system then asks the user for missing details about their home if the handoff is made to the neigbouring agent 

     * Size (sq ft or m²)
     * Number of bathrooms
     * Number of bedrooms
   * Using this input, the system finds the **closest matching properties** from the nearby properties data.
   * The average listing price of these matches becomes the **CHV**.

3. **ARV & Renovation Allowance Calculation**

   * Search in the codebase for how **After Renovated Value (ARV)** and **Renovation Allowance** are calculated.
   * Using the defined procedure:

     * Compute **ARV** for the entered address property.
     * Apply the Renograte Formula:

     $$
     \text{Renovation Allowance} = (\text{ARV} \times 87\%) - \text{CHV}
     $$

4. **Final Output**

   * The **CHV**, **ARV**, and **Renovation Allowance** are displayed on the **Estimate Page**.

