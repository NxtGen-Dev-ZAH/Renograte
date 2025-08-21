export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  template: (data: Record<string, unknown>) => string;
}

export const serviceProviderAgreementTemplate = (data: Record<string, unknown>): string => {
  return `
    RENOGRATE® SERVICE PROVIDER AGREEMENT

    This Service Provider Agreement ("Agreement") is entered into by and between the
    Contractor or Service Provider ("Contractor"), the Property Owner ("Seller"), and/or the
    Prospective Buyer ("Buyer") of the real property listed below. This Agreement governs the
    scope of work, payment terms, warranties, and legal protections for renovation services
    performed prior to or during the sale process of the identified property.

    Property Address: ${data.propertyAddress || '[PROPERTY ADDRESS]'}

    1. Scope of Work
    The Contractor shall provide renovation services as agreed upon in a separate, signed Work
    Order approved by the Buyer and Seller before work begins.

    2. Work Schedule
    Start Date: ${data.startDate || '[START DATE]'}
    Estimated Completion Date: ${data.completionDate || '[COMPLETION DATE]'}

    3. Compensation and Payment Terms
    Contractor shall be paid in full at the closing of the sale using proceeds from the transaction.
    An agreed portion of the Earnest Money Deposit (EMD), up to 50%, may be released to the
    Contractor as a down payment if authorized through escrow instructions.

    4. Approval and Quality Assurance
    Buyer may inspect and approve all completed work prior to closing. Contractor must
    address any deficiencies promptly.

    5. Warranties & Insurance
    Contractor warrants that all work will be performed in a professional, workmanlike manner
    and compliant with applicable codes. Contractor affirms possession of proper licensing,
    general liability insurance, and workers' compensation coverage, and shall provide proof
    upon request.

    6. Independent Contractor Status
    Contractor is not an employee or agent of Renograte LLC or any real estate professional.
    Contractor is solely responsible for legal and tax obligations.

    7. Hold Harmless and Indemnification
    All Parties agree to hold harmless and indemnify Renograte LLC, the brokerage, and any
    licensed real estate agents involved from any claim arising out of renovation work,
    including but not limited to property damage, injury, delays, or disputes over payments or
    workmanship.

    8. Contingency Events
    If the Buyer defaults on the Option Agreement or Purchase and Sale Agreement:
    - The Seller shall become liable to pay the Contractor the full amount for all renovation
    work performed, due either:
    - At the time of the next sale of the Property to a new buyer, or
    - At closing if the Seller re-lists and sells the Property.
    - The Seller shall retain the Earnest Money Deposit (EMD) from the defaulting Buyer, which
    may be used to offset Contractor payment.
    - Contractor may file a mechanic's lien as permitted by local law.

    If the Seller cancels or breaches the sale without Buyer fault:
    - Seller is immediately liable for full payment to the Contractor.
    - Contractor may pursue collection and lien rights.

    If both Parties mutually terminate:
    - Contractor is paid from escrowed funds if available.
    - Any balance becomes the Seller's liability and may be paid at the next closing.
    - Contractor may pursue lien rights for unpaid work.

    9. Legal Review and Acknowledgment
    Each Party acknowledges that they have reviewed and understand this Agreement and had
    an opportunity to seek legal advice.

    10. Signatures
    Seller Signature: ________________________________ Date: ________________

    Buyer Signature: ________________________________ Date: ________________

    Contractor Signature: ________________________________ Date: ________________
  `;
};

export const optionContractTemplate = (data: Record<string, unknown>): string => {
  return `
    RENOGRATE® OPTION AGREEMENT TO RENOVATE REAL ESTATE BEFORE SALE OF PROPERTY

    (Addendum to Real Estate Purchase and Sale Agreement)

    Date: ${data.date || '[DATE]'}

    Seller Name(s): ${data.sellerName || '[SELLER NAME]'}

    Seller Address: ${data.sellerAddress || '[SELLER ADDRESS]'}

    Buyer Name(s): ${data.buyerName || '[BUYER NAME]'}

    Buyer Address: ${data.buyerAddress || '[BUYER ADDRESS]'}

    Property Address: ${data.propertyAddress || '[PROPERTY ADDRESS]'}

    1. PURPOSE AND GRANT OF OPTION
    The Seller grants the Buyer the right to access and control the Property prior to the closing
    date for the limited purpose of facilitating renovations as agreed upon by the Parties and
    their contractor, with the objective of achieving the mutually agreed After Renovation Value
    (ARV) of the Property.

    Upon completion of renovations:
    • Buyer shall exercise the option to purchase the Property at the agreed ARV.
    • A standard Real Estate Purchase and Sale Agreement ("PSA") shall govern the final sale.

    Agreed ARV Sale Price: $${data.arvSalePrice || '[AMOUNT]'} USD

    2. EARNEST MONEY DEPOSIT (EMD) & ESCROW
    The Buyer agrees to deposit the sum of $${data.earnestMoney || '[AMOUNT]'} USD as Earnest Money, held in escrow
    by a mutually agreed Title or Escrow Agent. This Agreement becomes binding upon
    confirmation of receipt of the EMD.

    Release & Forfeiture Terms:
    • If Buyer fails to close: Buyer forfeits EMD.
    • If Seller fails to complete sale post-renovation: Buyer is refunded EMD.
    • If both Parties mutually terminate: Seller assumes liability for renovation costs; EMD
    refunded.

    It is suggested that up to 50% of the EMD may be released to the Contractor as a down
    payment per the Renograte Service Provider Agreement.

    3. RENOVATION, PAYMENT, AND APPRAISAL ADJUSTMENTS
    Buyer shall pay the full ARV at closing.
    • Contractor shall receive payment at closing as per the Renograte Service Provider
    Agreement.

    If the final appraisal is less than the agreed ARV:
    a. Parties may mutually agree to the lower value.
    b. A second appraisal may be requested (requesting party bears cost); the final value shall
    be the average of both.
    c. Parties may renegotiate terms per the PSA and relevant local laws.

    4. MORTGAGE EXPENSE ALLOWANCE (IF APPLICABLE)
    Where agreed, Buyer will provide Seller with a mortgage expense allowance of $${data.mortgageAllowance || '[AMOUNT]'}
    USD for ${data.mortgageMonths || '[NUMBER]'} month(s), either upfront or at closing, to cover the Seller's holding costs during
    renovations.

    5. RENOGRATE® ROLE, FEES, AND LIABILITY
    Renograte LLC shall receive a $499 transaction/administration fee at closing.

    Renograte LLC is not a party to this transaction beyond:
    • Administrative coordination.
    • Connection of Parties to licensed contractors and agents.
    • Optional support or recommendations when requested.

    Renograte LLC assumes no liability for:
    • The condition of the Property.
    • Work performed by third-party contractors.
    • Any disputes arising from renovations or sale.

    Release Clause: The Seller and Buyer hereby release Renograte LLC, its affiliates,
    contractors, agents, and representatives from any present or future claims related to the
    condition or transaction of the Property.

    6. PROPERTY INSPECTION RIGHTS
    Buyer shall have reasonable access to inspect the Property and may hire licensed
    professionals for inspection, including general, structural, and pest assessments.

    Notice of defects must be provided to the Seller within 10 calendar days of inspection report
    receipt.

    7. ACCEPTANCE OF PROPERTY CONDITION
    Following completion of this Agreement, Buyer accepts the Property "as-is." The Seller is
    not responsible for further improvements, except those included in the agreed renovation
    scope.

    8. BUSINESS PURPOSE AFFIDAVIT
    Seller acknowledges that this transaction is conducted for business purposes, with full
    understanding of the associated risks (e.g., final sale price variance).

    Seller acknowledges that they are acting in a business capacity, not as a consumer, and
    therefore waives any rights under consumer lending laws.

    9. REALTOR PARTICIPATION & LISTING AGREEMENT
    A licensed Realtor will:
    • Execute a pre-sale listing agreement with the Seller.
    • List the Property for the ARV post-renovation sale.
    • Ensure that the Property cannot be listed at a higher price after renovations without
    consent from the Parties.

    10. LEGAL REVIEW AND ACKNOWLEDGEMENT
    Each Party acknowledges that they have had the opportunity to review this Agreement,
    seek legal advice, and fully understand its terms.

    This document represents the full understanding and intent of the Parties regarding the
    renovation and sale of the Property.

    SIGNATURES
    Seller Signature: ________________________________ Date: ________________

    Seller Signature: ________________________________ Date: ________________

    Buyer Signature: ________________________________ Date: ________________

    Buyer Signature: ________________________________ Date: ________________

    Real Estate Agent (Witness): __________________ Date: ________________

    Notes:
    This document is intended to be used with a Real Estate Purchase and Sale Agreement and a
    Renograte Service Provider Agreement.
    All parties are encouraged to review with counsel in the governing jurisdiction.
  `;
};

export const jointVentureAgreementTemplate = (data: Record<string, unknown>): string => {
  return `
    JOINT VENTURE AGREEMENT

    THIS AGREEMENT made this ${data.date || '[DATE]'} by and between:

    ${data.partyOne || '[PARTY ONE]'} (hereinafter called "FIRST PARTY")
    
    AND
    
    ${data.partyTwo || '[PARTY TWO]'} (hereinafter called "SECOND PARTY")

    PROPERTY ADDRESS: ${data.propertyAddress || '[PROPERTY ADDRESS]'}

    1. PURPOSE: The parties hereby form a Joint Venture for the purpose of:
       ${data.purpose || '[PURPOSE OF JOINT VENTURE]'}

    2. CAPITAL CONTRIBUTIONS:
       a) FIRST PARTY shall contribute: $${data.contributionOne || '[AMOUNT]'} (${data.percentageOne || '[PERCENTAGE]'}%)
       b) SECOND PARTY shall contribute: $${data.contributionTwo || '[AMOUNT]'} (${data.percentageTwo || '[PERCENTAGE]'}%)

    3. PROFIT AND LOSS DISTRIBUTION:
       a) FIRST PARTY: ${data.profitOne || '[PERCENTAGE]'}%
       b) SECOND PARTY: ${data.profitTwo || '[PERCENTAGE]'}%

    4. TERM: This Joint Venture shall commence on ${data.startDate || '[DATE]'} and continue until ${data.endDate || '[DATE]'} or until the purpose is accomplished.

    5. MANAGEMENT: Decisions regarding the Joint Venture shall be made as follows:
       ${data.management || '[MANAGEMENT STRUCTURE]'}

    6. ADDITIONAL TERMS: ${data.terms || '[ADDITIONAL TERMS]'}

    IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.

    FIRST PARTY: ________________________________     Date: ________________
                ${data.partyOne || '[PARTY ONE]'}

    SECOND PARTY: _________________________________     Date: ________________
                 ${data.partyTwo || '[PARTY TWO]'}
  `;
};

export const leaseOptionAgreementTemplate = (data: Record<string, unknown>): string => {
  return `
    LEASE WITH OPTION TO PURCHASE AGREEMENT

    THIS AGREEMENT made this ${data.date || '[DATE]'} by and between:

    ${data.partyOne || '[PROPERTY OWNER]'} (hereinafter called "LANDLORD")
    
    AND
    
    ${data.partyTwo || '[TENANT]'} (hereinafter called "TENANT")

    PROPERTY ADDRESS: ${data.propertyAddress || '[PROPERTY ADDRESS]'}

    1. LEASE TERM: LANDLORD leases to TENANT the above property for a term of ${data.leaseTerm || '[TERM]'} beginning on ${data.leaseStart || '[START DATE]'} and ending on ${data.leaseEnd || '[END DATE]'}.

    2. RENT: TENANT agrees to pay monthly rent of $${data.monthlyRent || '[AMOUNT]'} due on the ${data.rentDueDay || '[DAY]'} of each month.

    3. OPTION TO PURCHASE:
       a) Option Period: TENANT has the option to purchase the property during the period from ${data.optionStart || '[START DATE]'} to ${data.optionEnd || '[END DATE]'}.
       b) Purchase Price: If TENANT exercises the option, the purchase price shall be $${data.purchasePrice || '[AMOUNT]'}.
       c) Option Fee: TENANT shall pay a non-refundable option fee of $${data.optionFee || '[AMOUNT]'} upon execution of this Agreement.
       d) Rent Credit: ${data.rentCredit || '[PERCENTAGE/AMOUNT]'} of each monthly rent payment shall be credited toward the purchase price if the option is exercised.

    4. EXERCISE OF OPTION: To exercise the option, TENANT must provide written notice to LANDLORD no later than ${data.exerciseDeadline || '[DATE]'}.

    5. ADDITIONAL TERMS: ${data.terms || '[ADDITIONAL TERMS]'}

    IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.

    LANDLORD: ________________________________     Date: ________________
              ${data.partyOne || '[PROPERTY OWNER]'}

    TENANT: _________________________________     Date: ________________
            ${data.partyTwo || '[TENANT]'}
  `;
};

export const contractTemplates: ContractTemplate[] = [
  {
    id: "service-provider",
    name: "Renograte Service Provider Agreement",
    description: "Contract for service providers",
    template: (data) => {
      return `
        # Renograte Service Provider Agreement
        
        This Service Provider Agreement ("Agreement") is entered into by and between:
        
        SELLER: ${data.sellerName || '[SELLER NAME]'}
        Address: ${data.sellerAddress || '[SELLER ADDRESS]'}
        
        BUYER: ${data.buyerName || '[BUYER NAME]'}
        Address: ${data.buyerAddress || '[BUYER ADDRESS]'}
        
        CONTRACTOR: ${data.contractorName || '[CONTRACTOR NAME]'}
        Address: ${data.contractorAddress || '[CONTRACTOR ADDRESS]'}
        
        PROPERTY ADDRESS: ${data.propertyAddress || '[PROPERTY ADDRESS]'}
        
        AGREEMENT DATE: ${data.agreementDate || '[AGREEMENT DATE]'}
        AGREEMENT ID: ${data.agreementId || '[AGREEMENT ID]'}
        
        WORK SCHEDULE:
        Start Date: ${data.startDate || '[START DATE]'}
        Estimated Completion Date: ${data.estimatedCompletionDate || '[COMPLETION DATE]'}
        
        This Agreement governs the scope of work, payment terms, warranties, and legal protections for renovation services performed prior to or during the sale process of the identified property.
      `;
    }
  },
  {
    id: "option-contract",
    name: "Renograte Option Contract",
    description: "Option agreement for property renovation",
    template: (data) => {
      return `
        # Renograte Option Agreement
        
        This Option Agreement ("Agreement") is entered into by and between:
        
        SELLER: ${data.sellerName || '[SELLER NAME]'}
        Address: ${data.sellerAddress || '[SELLER ADDRESS]'}
        
        BUYER: ${data.buyerName || '[BUYER NAME]'}
        Address: ${data.buyerAddress || '[BUYER ADDRESS]'}
        
        PROPERTY ADDRESS: ${data.propertyAddress || '[PROPERTY ADDRESS]'}
        
        AGREEMENT DATE: ${data.agreementDate || '[AGREEMENT DATE]'}
        AGREEMENT ID: ${data.agreementId || '[AGREEMENT ID]'}
        
        FINANCIAL DETAILS:
        ARV Sale Price: $${data.arvSalePrice || '[ARV SALE PRICE]'}
        Earnest Money Deposit: $${data.emdAmount || '[EMD AMOUNT]'}
        Mortgage Allowance Amount: $${data.mortgageAllowanceAmount || '[MORTGAGE ALLOWANCE]'}
        Mortgage Allowance Period: ${data.mortgageAllowanceMonths || '[MONTHS]'} month(s)
        
        AGENT INFORMATION:
        Agent Name: ${data.agentName || '[AGENT NAME]'}
        
        This Agreement grants the Buyer the right to access and control the Property prior to the closing date for the purpose of facilitating renovations.
      `;
    }
  },
  {
    id: "joint-venture",
    name: "Joint Venture Agreement",
    description: "Joint venture partnership",
    template: (data) => {
      return `
        # Joint Venture Agreement
        
        This Joint Venture Agreement ("Agreement") is entered into by and between:
        
        PARTNER 1: ${data.partner1Name || '[PARTNER 1 NAME]'}
        Address: ${data.partner1Address || '[PARTNER 1 ADDRESS]'}
        Contribution: $${data.partner1Contribution || '[CONTRIBUTION]'}
        Ownership Percentage: ${data.partner1Percentage || '[PERCENTAGE]'}%
        
        PARTNER 2: ${data.partner2Name || '[PARTNER 2 NAME]'}
        Address: ${data.partner2Address || '[PARTNER 2 ADDRESS]'}
        Contribution: $${data.partner2Contribution || '[CONTRIBUTION]'}
        Ownership Percentage: ${data.partner2Percentage || '[PERCENTAGE]'}%
        
        PROJECT INFORMATION:
        Project Name: ${data.projectName || '[PROJECT NAME]'}
        Project Address: ${data.projectAddress || '[PROJECT ADDRESS]'}
        Project Description: ${data.projectDescription || '[PROJECT DESCRIPTION]'}
        
        TIMELINE:
        Start Date: ${data.startDate || '[START DATE]'}
        Estimated Completion Date: ${data.estimatedCompletionDate || '[COMPLETION DATE]'}
        
        FINANCIAL DETAILS:
        Total Investment: $${data.totalInvestment || '[TOTAL INVESTMENT]'}
        Profit Split Ratio: ${data.profitSplitRatio || '[PROFIT SPLIT RATIO]'}
        
        AGREEMENT DATE: ${data.agreementDate || '[AGREEMENT DATE]'}
        AGREEMENT ID: ${data.agreementId || '[AGREEMENT ID]'}
        
        This Agreement establishes the terms and conditions for a joint venture partnership in real estate investment and development.
      `;
    }
  },
  {
    id: "lease-option",
    name: "Lease Option Agreement",
    description: "Lease with purchase option",
    template: (data) => {
      return `
        # Lease Option Agreement
        
        This Lease Option Agreement ("Agreement") is entered into by and between:
        
        LANDLORD: ${data.landlordName || '[LANDLORD NAME]'}
        Address: ${data.landlordAddress || '[LANDLORD ADDRESS]'}
        
        TENANT: ${data.tenantName || '[TENANT NAME]'}
        Address: ${data.tenantAddress || '[TENANT ADDRESS]'}
        
        PROPERTY ADDRESS: ${data.propertyAddress || '[PROPERTY ADDRESS]'}
        
        LEASE TERMS:
        Lease Start Date: ${data.leaseStartDate || '[START DATE]'}
        Lease End Date: ${data.leaseEndDate || '[END DATE]'}
        Monthly Rent: $${data.monthlyRent || '[MONTHLY RENT]'}
        Security Deposit: $${data.securityDeposit || '[SECURITY DEPOSIT]'}
        
        OPTION TERMS:
        Option Period: ${data.optionPeriod || '[OPTION PERIOD]'} months
        Purchase Price: $${data.purchasePrice || '[PURCHASE PRICE]'}
        Option Fee: $${data.optionFee || '[OPTION FEE]'}
        Rent Credit: $${data.rentCredit || '[RENT CREDIT]'} per month
        
        AGREEMENT DATE: ${data.agreementDate || '[AGREEMENT DATE]'}
        AGREEMENT ID: ${data.agreementId || '[AGREEMENT ID]'}
        
        This Agreement establishes the terms and conditions for leasing the property with an option to purchase.
      `;
    }
  }
];

export const getTemplateById = (id: string): ContractTemplate | undefined => {
  return contractTemplates.find(template => template.id === id);
}; 