export interface ContractTemplate {
  id: string;
  name: string;
  template: (data: any) => string;
}

export const purchaseAgreementTemplate = (data: any): string => {
  return `
    REAL ESTATE PURCHASE AGREEMENT

    THIS AGREEMENT made this ${data.date || '[DATE]'} by and between:

    ${data.partyOne || '[SELLER NAME]'} (hereinafter called "SELLER")
    
    AND
    
    ${data.partyTwo || '[BUYER NAME]'} (hereinafter called "BUYER")

    WITNESSETH: That the SELLER agrees to sell and the BUYER agrees to buy the following described real estate:

    Property Address: ${data.propertyAddress || '[PROPERTY ADDRESS]'}

    1. PURCHASE PRICE: The purchase price is $${data.purchasePrice || '[AMOUNT]'} payable as follows:
       a) Earnest Money Deposit: $${data.earnestMoney || '[AMOUNT]'} upon execution of this Agreement.
       b) Balance Due at Closing: $${data.balanceDue || '[AMOUNT]'} payable at closing.

    2. CLOSING DATE: The closing shall take place on or before ${data.closingDate || '[DATE]'}.

    3. POSSESSION: Possession shall be delivered to BUYER on ${data.possessionDate || '[DATE]'}.

    4. INSPECTIONS: BUYER shall have the right to conduct inspections of the property within ${data.inspectionDays || '[NUMBER]'} days after acceptance of this Agreement.

    5. TITLE: SELLER shall convey marketable title to the property by ${data.deedType || 'Warranty Deed'}.

    6. ADDITIONAL TERMS: ${data.terms || '[ADDITIONAL TERMS]'}

    IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.

    SELLER: ________________________________     Date: ________________
           ${data.partyOne || '[SELLER NAME]'}

    BUYER: _________________________________     Date: ________________
           ${data.partyTwo || '[BUYER NAME]'}
  `;
};

export const renovationContractTemplate = (data: any): string => {
  return `
    RENOVATION CONTRACT

    THIS AGREEMENT made this ${data.date || '[DATE]'} by and between:

    ${data.partyOne || '[PROPERTY OWNER]'} (hereinafter called "OWNER")
    
    AND
    
    ${data.partyTwo || '[CONTRACTOR]'} (hereinafter called "CONTRACTOR")

    PROPERTY ADDRESS: ${data.propertyAddress || '[PROPERTY ADDRESS]'}

    1. SCOPE OF WORK: CONTRACTOR agrees to furnish all labor, materials, equipment, and services necessary to complete the following renovation work:
       ${data.scopeOfWork || '[DETAILED DESCRIPTION OF WORK]'}

    2. CONTRACT PRICE: OWNER agrees to pay CONTRACTOR the sum of $${data.contractPrice || '[AMOUNT]'} for the work specified.

    3. PAYMENT SCHEDULE:
       a) Down Payment: $${data.downPayment || '[AMOUNT]'} upon execution of this Agreement.
       b) Progress Payments: ${data.progressPayments || '[PAYMENT SCHEDULE]'}
       c) Final Payment: $${data.finalPayment || '[AMOUNT]'} upon completion and final inspection.

    4. COMPLETION DATE: CONTRACTOR shall substantially complete the work no later than ${data.completionDate || '[DATE]'}.

    5. WARRANTIES: CONTRACTOR warrants all work to be free from defects in materials and workmanship for a period of ${data.warrantyPeriod || '[PERIOD]'}.

    6. ADDITIONAL TERMS: ${data.terms || '[ADDITIONAL TERMS]'}

    IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first above written.

    OWNER: ________________________________     Date: ________________
           ${data.partyOne || '[PROPERTY OWNER]'}

    CONTRACTOR: _________________________________     Date: ________________
                ${data.partyTwo || '[CONTRACTOR]'}
  `;
};

export const jointVentureAgreementTemplate = (data: any): string => {
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

export const leaseOptionAgreementTemplate = (data: any): string => {
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
    id: "purchase",
    name: "Purchase Agreement",
    template: purchaseAgreementTemplate,
  },
  {
    id: "renovation",
    name: "Renovation Contract",
    template: renovationContractTemplate,
  },
  {
    id: "joint-venture",
    name: "Joint Venture Agreement",
    template: jointVentureAgreementTemplate,
  },
  {
    id: "lease-option",
    name: "Lease Option Agreement",
    template: leaseOptionAgreementTemplate,
  },
];

export const getTemplateById = (id: string): ContractTemplate | undefined => {
  return contractTemplates.find(template => template.id === id);
}; 