## **Renograte Renovation Allowance Estimator – End-to-End Workflow**

### **1. User Input**

* **Frontend (React/Next.js or your framework)**

  * User enters a property address in an input field.
  * On form submission:

    * Call the backend API endpoint `/estimate-renovation-allowance`.

---

### **2. Address → Coordinates**

* **Backend Step 1: Geocoding**

  * Use **Google Maps Geocoding API** (or an alternative like Mapbox or OpenStreetMap) to convert the address into latitude & longitude.
  * Example API request:

    ```
    https://maps.googleapis.com/maps/api/geocode/json?address=123+Main+St&key=YOUR_KEY
    ```
  * Response contains:

    ```json
    {
      "lat": 38.8977,
      "lng": -77.0365
    }
    ```

---

### **3. Identify Subject Property**

* **Backend Step 2: Realtyna + Bright MLS**

  * Use **Realtyna API** to search for the exact property by coordinates (radius = 0.05 miles for an exact match).
  * Fetch:

    * Square footage
    * Lot size
    * Bedrooms & bathrooms
    * Year built
    * Current listing status

---

### **4. Find Comparable Properties**

* **Backend Step 3: Bright MLS Nearby Search**

  * From the subject property’s coordinates, query Bright MLS (via Realtyna API) for:

    * **Renovated comps** → filter by recently sold, renovated condition, same property type, within 1-mile radius, similar size (±10%).
    * **As-is comps** → filter by sold “as-is” or average condition, same parameters.

---

### **5. Calculate ARV & CHV**

* **ARV (After Renovated Value)**

  * Take **average sale price of top 3 renovated comps**.

* **CHV (Current Home Value)**

  * Take **average sale price of top 3 as-is comps**.

---

### **6. Apply Renograte Formula**

$$
\text{Renovation Allowance} = (\text{ARV} \times 87\%) - \text{CHV}
$$

* Example:

  * ARV = \$1,000,000
  * CHV = \$800,000
  * Formula: `(1,000,000 × 0.87) - 800,000 = $70,000`

---

### **7. Output & Lead Capture**

* **Frontend display:**

  * Show:

    * Property Address
    * ARV
    * CHV
    * Estimated Renovation Allowance (big, highlighted)
  * Add:

    * **Button** → “Contact a Renograte Agent” (opens lead form)
    * **Link** → “Email Renograte” (pre-filled subject & details)
  * Store lead in CRM via API.

---

### **8. Optional AI Enhancement**

* Integrate **Google Gemini, ChatGPT, or Custom AI** to:

  * Automatically interpret Bright MLS data.
  * Verify comps are truly “renovated” vs “as-is”.
  * Provide a 1-paragraph property investment summary.

---

### **Tech Stack Summary**

* **Frontend:** Next.js/React
* **Backend:** Node.js (Express/NestJS)
* **APIs:**

  * Google Maps Geocoding API
  * Realtyna API (Bright MLS feed)
  * AI API (optional)
* **Database:** PostgreSQL/MySQL for lead storage
* **CRM Integration:** HubSpot, Salesforce, or custom

