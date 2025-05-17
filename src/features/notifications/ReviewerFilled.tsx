import { useState } from 'react';
import { JsonEditor } from '../../components/JsonEditor';
import { PersonSelector } from '../../components/PersonSelector';
import { apiService } from '../../services/apiService';
import type { MarkReviewerFilledPayload } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { mockPersons } from '../../data/mockPersons';

const DEFAULT_PAYLOAD: MarkReviewerFilledPayload = {
    correlationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    requestedBy: {
        email: mockPersons[3].email, // Dasha
        name: mockPersons[3].name
    },
    reviewer: {
        email: mockPersons[2].email, // Alexander
        name: mockPersons[2].name
    },
    talent: {
        email: mockPersons[0].email, // Nikita
        name: mockPersons[0].name
    }
};

export function ReviewerFilled() {
    const { token } = useAuth();
    const [payload, setPayload] = useState<MarkReviewerFilledPayload>(DEFAULT_PAYLOAD);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string; data?: any }>({});
    const [overrideEmail, setOverrideEmail] = useState<string>("");

    // Handle payload updates from the JSON editor
    const handlePayloadChange = (newPayload: MarkReviewerFilledPayload) => {
        setPayload(newPayload);
    };

    const updateRequestedBy = (person: typeof mockPersons[0]) => {
        const updatedPayload = {
            ...payload,
            requestedBy: {
                name: person.name,
                email: person.email
            }
        };
        setPayload(updatedPayload);
    };    const updateReviewer = (person: typeof mockPersons[0]) => {
        // If override email is set, use that instead of the person's email
        const emailToUse = overrideEmail.trim() ? overrideEmail : person.email;
        
        const updatedPayload = {
            ...payload,
            reviewer: {
                name: person.name,
                email: emailToUse
            }
        };
        setPayload(updatedPayload);
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
    };

    const updateOverrideEmail = (email: string) => {
        setOverrideEmail(email);
        
        if (email.trim()) {
            // If an override email is provided, update the reviewer's email in the payload
            const updatedPayload = {
                ...payload,
                reviewer: {
                    ...payload.reviewer,
                    email: email.trim()
                }
            };
            setPayload(updatedPayload);
        } else if (overrideEmail.trim()) {
            // If clearing the override, restore the original email
            const matchedPerson = mockPersons.find(p => p.name === payload.reviewer.name);
            if (matchedPerson) {
                const updatedPayload = {
                    ...payload,
                    reviewer: {
                        ...payload.reviewer,
                        email: matchedPerson.email
                    }
                };
                setPayload(updatedPayload);
            }
        }
    };

    const handleSubmit = async () => {
        if (!token) {
            setResult({
                success: false,
                message: "You must be authenticated to perform this action"
            });
            return;
        }

        setIsLoading(true);
        setResult({});

        try {
            const payloadToSend = { ...payload };
            const response = await apiService.markReviewerFilled(payloadToSend, token);
            
            setResult({
                success: true,
                message: "Reviewer successfully marked as having submitted feedback!",
                data: response
            });
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : "Failed to mark reviewer as having submitted feedback"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <PersonSelector 
                        label="Talent Manager" 
                        initialPerson={mockPersons[3]} 
                        onPersonChange={updateRequestedBy}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Talent manager who requested the feedback
                    </p>
                </div>                <div>
                    <PersonSelector 
                        label="Reviewer" 
                        initialPerson={mockPersons[2]} 
                        onPersonChange={updateReviewer}
                        overrideEmail={overrideEmail}
                        isOverridden={!!overrideEmail}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Reviewer who submitted the feedback
                    </p>
                </div>
                <div>
                    <PersonSelector 
                        label="Talent" 
                        initialPerson={mockPersons[0]} 
                        onPersonChange={updateTalent}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Talent being reviewed
                    </p>
                </div>
            </div>            <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300">
                        Override Reviewer Email
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
                
                <div className="mb-2">
                    <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1">
                        Override with email used in "Send Feedback forms to Reviewers" step:
                    </label>
                    <input
                        type="email"
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={overrideEmail}
                        onChange={(e) => updateOverrideEmail(e.target.value)}
                        placeholder="reviewer@mailinator.com"
                    />
                </div>
                
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    <p className="font-medium">Important:</p> You must override the reviewer's email to match the one used in the "Send Feedback forms to Reviewers" step, as the system searches by email address.
                </div>
                
                {overrideEmail && (
                    <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-sm rounded flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span><span className="font-medium">Override active:</span> The reviewer's email is now set to <span className="font-mono font-medium">{overrideEmail}</span></span>
                    </div>
                )}
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            Important Note
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <p>
                                This action will mark the reviewer as having submitted feedback and will prevent any further notifications 
                                from being sent to them. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
            </div>            <div>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Edit Payload
                    </h3>
                    {overrideEmail && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md">
                            Email Override Active
                        </span>
                    )}
                </div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    Advanced: You can edit the complete JSON payload directly.
                </p>
                {overrideEmail && (
                    <p className="mb-2 text-sm text-blue-600 dark:text-blue-400">
                        <span className="font-medium">Note:</span> The reviewer email is currently overridden. You can edit any part of the JSON including the email.
                    </p>
                )}
                <JsonEditor initialValue={payload} onChange={handlePayloadChange} />
            </div>

            <div className="flex items-center">
                <button 
                    onClick={handleSubmit} 
                    disabled={isLoading} 
                    className="btn btn-primary mr-4"
                >
                    {isLoading ? "Processing..." : "Mark Feedback as Submitted"}
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
