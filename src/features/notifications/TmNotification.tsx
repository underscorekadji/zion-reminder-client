import { useState } from 'react';
import { JsonEditor } from '../../components/JsonEditor';
import { PersonSelector } from '../../components/PersonSelector';
import type { TmNotificationPayload } from '../../services/apiService';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { mockPersons } from '../../data/mockPersons';

const DEFAULT_PAYLOAD: TmNotificationPayload = {
  correlationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  talentManager: {
    email: mockPersons[3].email, // Dasha
    name: mockPersons[3].name
  },
  talent: {
    email: mockPersons[0].email, // Nikita
    name: mockPersons[0].name
  },
  by: {
    email: mockPersons[5].email, // Andrew
    name: mockPersons[5].name
  },
  applicationLink: "https://performance.review.app/feedback/12345",
  startDate: "2025-05-17T07:25:43.306Z",
  endDate: "2025-05-17T07:25:43.306Z"
};

export function TmNotification() {
  const { token } = useAuth();
  const [payload, setPayload] = useState<TmNotificationPayload>(DEFAULT_PAYLOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; data?: any }>({});  const [applicationUrl, setApplicationUrl] = useState<string>(DEFAULT_PAYLOAD.applicationLink);
  const [startDate, setStartDate] = useState<string>(DEFAULT_PAYLOAD.startDate);
  const [endDate, setEndDate] = useState<string>(DEFAULT_PAYLOAD.endDate);
  const [overrideEmail, setOverrideEmail] = useState<string>("");
  
  // Handle payload updates from the JSON editor or form fields
  const handlePayloadChange = (newPayload: TmNotificationPayload) => {
    // Update the main payload state
    setPayload(newPayload);
    
    // Update form fields to match the JSON if they've changed
    // Using the formatted value for comparison to avoid unnecessary updates
    if (newPayload.applicationLink !== applicationUrl) {
      setApplicationUrl(newPayload.applicationLink);
    }
    
    // For date fields, check both raw and formatted values
    const formattedStartDate = formatDateForInput(newPayload.startDate);
    const currentFormattedStartDate = formatDateForInput(startDate);
    if (formattedStartDate !== currentFormattedStartDate) {
      setStartDate(newPayload.startDate);
    }
    
    const formattedEndDate = formatDateForInput(newPayload.endDate);
    const currentFormattedEndDate = formatDateForInput(endDate);
    if (formattedEndDate !== currentFormattedEndDate) {
      setEndDate(newPayload.endDate);
    }
    
    // Check if talent manager email has been changed in the JSON editor
    // and update override email state accordingly
    const selectedTalentManager = mockPersons.find(p => p.name === newPayload.talentManager.name);
    if (selectedTalentManager && newPayload.talentManager.email !== selectedTalentManager.email) {
      // The email differs from the default for this person, so it's an override
      setOverrideEmail(newPayload.talentManager.email);
    } else if (overrideEmail && selectedTalentManager && newPayload.talentManager.email === selectedTalentManager.email) {
      // The email matches the default, so clear any override
      setOverrideEmail("");
    }
  };
  // Format a date object to ISO string for input value
  const formatDateForInput = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch (err) {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Format a date from input to ISO string with time
  const formatDateFromInput = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toISOString();
    } catch (err) {
      return new Date().toISOString();
    }
  };
  const updateTalentManager = (person: typeof mockPersons[0]) => {
    // Preserve any email override when changing talent manager
    const emailToUse = overrideEmail.trim() ? overrideEmail : person.email;
    
    const updatedPayload = {
      ...payload,
      talentManager: {
        name: person.name,
        email: emailToUse
      }
    };
    setPayload(updatedPayload);
    // Immediately update to ensure JSON editor is in sync
    handlePayloadChange(updatedPayload);
  };

  const updateTalent = (person: typeof mockPersons[0]) => {
    const updatedPayload = {
      ...payload,
      talent: {
        name: person.name,
        email: person.email
      }
    };
    setPayload(updatedPayload);
    // Immediately update to ensure JSON editor is in sync
    handlePayloadChange(updatedPayload);
  };

  const updateBy = (person: typeof mockPersons[0]) => {
    const updatedPayload = {
      ...payload,
      by: {
        name: person.name,
        email: person.email
      }
    };
    setPayload(updatedPayload);
    // Immediately update to ensure JSON editor is in sync
    handlePayloadChange(updatedPayload);
  };
  const updateApplicationLink = (url: string) => {
    // Update the local state
    setApplicationUrl(url);
    
    // Create updated payload
    const updatedPayload = {
      ...payload,
      applicationLink: url
    };
    
    // Use single state update path through handlePayloadChange
    handlePayloadChange(updatedPayload);
  };

  const updateStartDate = (date: string) => {
    // Format the date for ISO string
    const formattedDate = formatDateFromInput(date);
    
    // Update the local state with the input date
    setStartDate(formattedDate);
    
    // Create updated payload with formatted date
    const updatedPayload = {
      ...payload,
      startDate: formattedDate
    };
    
    // Use single state update path through handlePayloadChange
    handlePayloadChange(updatedPayload);
  };

  const updateEndDate = (date: string) => {
    // Format the date for ISO string
    const formattedDate = formatDateFromInput(date);
    
    // Update the local state with the input date
    setEndDate(formattedDate);
    
    // Create updated payload with formatted date
    const updatedPayload = {
      ...payload,
      endDate: formattedDate
    };
    
    // Use single state update path through handlePayloadChange
    handlePayloadChange(updatedPayload);
  };  const updateOverrideEmail = (email: string) => {
    // Get the default email for the current talent manager to display in UI
    const selectedTalentManager = mockPersons.find(p => p.name === payload.talentManager.name);
    const defaultEmail = selectedTalentManager ? selectedTalentManager.email : '';
    
    // Update the local state
    setOverrideEmail(email);
    
    // If there's a valid email, update the payload's talentManager.email directly
    if (email.trim()) {
      const updatedPayload = {
        ...payload,
        talentManager: {
          ...payload.talentManager,
          email: email.trim()
        }
      };
      // Update the payload and reflect changes in the JSON editor
      handlePayloadChange(updatedPayload);
    } else if (overrideEmail.trim() && !email.trim()) {
      // If clearing the override, restore the original email from the selected talent manager
      if (selectedTalentManager) {
        const updatedPayload = {
          ...payload,
          talentManager: {
            ...payload.talentManager,
            email: defaultEmail
          }
        };
        handlePayloadChange(updatedPayload);
      }
    }
  };

  const handleSend = async () => {
    if (!token) {
      setResult({
        success: false,
        message: "You must be authenticated to send notifications"
      });
      return;
    }

    setIsLoading(true);
    setResult({});    try {
      // Create a copy of the payload for sending
      // No need to override email here as it's already in the payload
      const payloadToSend = { ...payload };
      
      const response = await apiService.sendToTalentMentor(payloadToSend, token);
      setResult({
        success: true,
        message: "Notification sent successfully!",
        data: response
      });
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send notification"
      });
    } finally {
      setIsLoading(false);
    }
  };
    return (
    <div className="space-y-6">      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">        <div>
          <PersonSelector 
            label="Talent Manager" 
            initialPerson={mockPersons[3]} 
            onPersonChange={updateTalentManager}
            overrideEmail={overrideEmail}
            isOverridden={!!overrideEmail}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Person who will receive the notification as a talent manager
          </p>
        </div>
        <div>
          <PersonSelector 
            label="Talent" 
            initialPerson={mockPersons[0]} 
            onPersonChange={updateTalent} 
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The person being reviewed in this performance cycle
          </p>
        </div>
        <div>
          <PersonSelector 
            label="Requested By" 
            initialPerson={mockPersons[5]} 
            onPersonChange={updateBy} 
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Person requesting the performance review
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application Link
          </label>
          <input
            type="url"
            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={applicationUrl}
            onChange={(e) => updateApplicationLink(e.target.value)}
            placeholder="https://application.url/link"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            URL to the feedback form that will be included in the notification
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formatDateForInput(startDate)}
            onChange={(e) => updateStartDate(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            When the review period starts
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formatDateForInput(endDate)}
            onChange={(e) => updateEndDate(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            When the review period ends
          </p>
        </div>
      </div>      <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50 dark:bg-blue-900/20">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-blue-700 dark:text-blue-300">
            Override Talent Manager Email
          </label>
          {overrideEmail && (
            <button
              onClick={() => updateOverrideEmail("")}
              className="text-xs px-2 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-blue-200 rounded"
            >
              Reset to Default
            </button>
          )}
        </div>
        
        {/* Default email display */}
        <div className="mb-2">
          <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1">
            Default email for {payload.talentManager.name}:
          </label>
          <div className="text-sm font-mono px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded">
            {mockPersons.find(p => p.name === payload.talentManager.name)?.email || payload.talentManager.email}
          </div>
        </div>
        
        <div className="mb-2">
          <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1">
            Override with your email:
          </label>
          <input
            type="email"
            className="w-full p-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={overrideEmail}
            onChange={(e) => updateOverrideEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        
        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          Override will immediately update the payload and be used for notification sending
        </div>
        
        {overrideEmail && (
          <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-sm rounded flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span><span className="font-medium">Override active:</span> The talent manager's email is now set to <span className="font-mono font-medium">{overrideEmail}</span></span>
          </div>
        )}
      </div>      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Edit Full Notification Payload
          </h3>
          {overrideEmail && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md">
              Email Override Active
            </span>
          )}
        </div>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          Advanced: You can edit the complete JSON payload directly. Changes made here will update the form fields above automatically.
        </p>
        {overrideEmail && (
          <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
            <span className="font-medium">Note:</span> The talent manager email is currently overridden. You can edit any part of the JSON including the email.
          </p>
        )}
        <JsonEditor initialValue={payload} onChange={handlePayloadChange} />
      </div>

      <div className="flex items-center">
        <button 
          onClick={handleSend} 
          disabled={isLoading} 
          className="btn btn-primary mr-4"
        >
          {isLoading ? "Sending..." : "Send Notification"}
        </button>
      </div>

      {result.message && (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900'}`}>
          <p className="font-medium">{result.message}</p>
          {result.data && (
            <pre className="mt-2 text-sm overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
