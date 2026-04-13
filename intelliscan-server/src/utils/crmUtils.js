/**
 * CRM Utility functions for field mapping and schema definitions.
 */

/**
 * Returns the default field mappings for a given CRM provider.
 * @param {string} provider - The CRM provider (salesforce, hubspot, zoho, pipedrive)
 * @returns {Array} Default mappings
 */
function getDefaultMappings(provider) {
  // Salesforce and generic defaults
  const common = [
    { iscanField: 'Full Name', iscanKey: 'name', crmField: 'Name', type: 'String', required: true },
    { iscanField: 'Company Name', iscanKey: 'company', crmField: 'Account Name', type: 'String', required: true },
    { iscanField: 'Job Title', iscanKey: 'job_title', crmField: 'Title', type: 'String', required: false },
    { iscanField: 'Email Address', iscanKey: 'email', crmField: 'Email', type: 'Email', required: true },
    { iscanField: 'Phone Number', iscanKey: 'phone', crmField: 'MobilePhone', type: 'Phone', required: false },
    { iscanField: 'Website', iscanKey: 'website', crmField: 'Website', type: 'String', required: false },
    { iscanField: 'Industry (AI)', iscanKey: 'inferred_industry', crmField: 'Industry', type: 'Picklist', required: false, aiEnriched: true },
    { iscanField: 'Seniority (AI)', iscanKey: 'inferred_seniority', crmField: 'Lead_Level__c', type: 'Picklist', required: false, aiEnriched: true },
    { iscanField: 'AI Confidence', iscanKey: 'confidence', crmField: 'Lead_Score__c', type: 'Number', required: false },
  ];

  // Provider-specific CRM field name overrides
  if (provider === 'hubspot') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'firstname',
        'Account Name': 'company',
        'Title': 'jobtitle',
        'Email': 'email',
        'MobilePhone': 'mobilephone',
        'Website': 'website',
        'Industry': 'industry',
        'Lead_Level__c': 'hs_lead_status',
        'Lead_Score__c': 'hubspotscore',
      }[f.crmField] || f.crmField
    }));
  }

  if (provider === 'zoho') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'Full_Name',
        'Account Name': 'Account_Name',
        'Title': 'Title',
        'Email': 'Email',
        'MobilePhone': 'Mobile',
        'Website': 'Website',
        'Industry': 'Industry',
        'Lead_Level__c': 'Lead_Source',
        'Lead_Score__c': 'Rating',
      }[f.crmField] || f.crmField
    }));
  }

  if (provider === 'pipedrive') {
    return common.map(f => ({
      ...f,
      crmField: {
        'Name': 'name',
        'Account Name': 'org_name',
        'Title': 'title',
        'Email': 'email',
        'MobilePhone': 'phone',
        'Website': 'website',
        'Industry': 'industry',
        'Lead_Level__c': 'label',
        'Lead_Score__c': 'value',
      }[f.crmField] || f.crmField
    }));
  }

  return common; // default = Salesforce
}

/**
 * Returns the list of fields available in each CRM.
 * @param {string} provider - The CRM provider
 * @returns {Array} List of field names
 */
function getCrmSchema(provider) {
  const schemas = {
    salesforce: [
      'Name', 'Account Name', 'Title', 'Email', 'MobilePhone', 'Phone', 'Website',
      'Industry', 'Lead_Level__c', 'Lead_Score__c', 'LinkedIn_URL__c',
      'Description', 'LeadSource', 'Status', 'Rating', 'AnnualRevenue',
      'NumberOfEmployees', 'Country', 'City', 'Street', 'PostalCode', 'State',
      'Custom_Field_1__c', 'Custom_Field_2__c', 'Custom_Field_3__c',
      '-- Do not sync --'
    ],
    hubspot: [
      'firstname', 'lastname', 'company', 'jobtitle', 'email', 'mobilephone',
      'phone', 'website', 'industry', 'hs_lead_status', 'hubspotscore',
      'linkedin_bio', 'description', 'num_employees', 'annualrevenue',
      'country', 'city', 'address', 'zip', 'state',
      '-- Do not sync --'
    ],
    zoho: [
      'Full_Name', 'Account_Name', 'Title', 'Email', 'Mobile', 'Phone',
      'Website', 'Industry', 'Lead_Source', 'Rating', 'LinkedIn_Id',
      'Description', 'No_of_Employees', 'Annual_Revenue',
      'Country', 'City', 'Street', 'Zip_Code', 'State',
      '-- Do not sync --'
    ],
    pipedrive: [
      'name', 'org_name', 'title', 'email', 'phone', 'website',
      'industry', 'label', 'value', 'notes',
      'address_country', 'address_city', 'address_street',
      '-- Do not sync --'
    ]
  };
  return schemas[provider] || schemas.salesforce;
}

module.exports = {
  getDefaultMappings,
  getCrmSchema
};
