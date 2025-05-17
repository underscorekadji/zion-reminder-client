import { useState, useEffect } from 'react';
import { JsonEditor } from '../../components/JsonEditor';
import { PersonSelector } from '../../components/PersonSelector';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { mockPersons } from '../../data/mockPersons';

export interface ReviewerNotificationPayload {
    correlationId: string;
    requestedBy: {
        email: string;
        name: string;
    };
    requestedFor: {
        email: string;
        name: string;
    };
    reviewers: Array<{
        email: string;
        name: string;
    }>;
    attempt: number;
    applicationLink: string;
    endDate: string;
}

const DEFAULT_PAYLOAD: ReviewerNotificationPayload = {
    correlationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    requestedBy: {
        email: mockPersons[3].email, // Dasha
        name: mockPersons[3].name
    },
    requestedFor: {
        email: mockPersons[0].email, // Nikita
        name: mockPersons[0].name
    },
    reviewers: [
        {
            email: mockPersons[2].email, // Alexander
            name: mockPersons[2].name
        }
    ],
    attempt: 5,
    applicationLink: "https://performance.review.app/feedback/12345",
    endDate: "2025-05-17T07:25:43.306Z"
};

export function ReviewerNotification() {
    const { token } = useAuth();
    const [payload, setPayload] = useState<ReviewerNotificationPayload>(DEFAULT_PAYLOAD);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string; data?: any }>({}); const [applicationUrl, setApplicationUrl] = useState<string>(DEFAULT_PAYLOAD.applicationLink);
    const [endDate, setEndDate] = useState<string>(DEFAULT_PAYLOAD.endDate);
    const [attempt, setAttempt] = useState<number>(DEFAULT_PAYLOAD.attempt);
    const [overrideEmail, setOverrideEmail] = useState<string>("");
    const [selectedReviewers, setSelectedReviewers] = useState<Array<typeof mockPersons[0]>>([mockPersons[2]]);

    // Handle payload updates from the JSON editor or form fields
    const handlePayloadChange = (newPayload: ReviewerNotificationPayload) => {
        // Update the main payload state
        setPayload(newPayload);

        // Update form fields to match the JSON if they've changed
        if (newPayload.applicationLink !== applicationUrl) {
            setApplicationUrl(newPayload.applicationLink);
        }

        if (newPayload.attempt !== attempt) {
            setAttempt(newPayload.attempt);
        }

        // For date fields, check both raw and formatted values
        const formattedEndDate = formatDateForInput(newPayload.endDate);
        const currentFormattedEndDate = formatDateForInput(endDate);
        if (formattedEndDate !== currentFormattedEndDate) {
            setEndDate(newPayload.endDate);
        }

        // Update selectedReviewers based on payload changes
        // This is more complex as we need to map between payload reviewers and mockPersons
        const newSelectedReviewers = newPayload.reviewers.map(reviewer => {
            // Try to find a matching person in mockPersons
            const matchedPerson = mockPersons.find(p => p.name === reviewer.name);
            if (matchedPerson) {
                return matchedPerson;
            }
            // If no match, create a new person object
            return { name: reviewer.name, email: reviewer.email };
        });

        setSelectedReviewers(newSelectedReviewers);

        // Check for email override
        // If any reviewer has an email that doesn't match its mockPerson counterpart
        const hasOverride = newPayload.reviewers.some(reviewer => {
            const matchedPerson = mockPersons.find(p => p.name === reviewer.name);
            return matchedPerson && reviewer.email !== matchedPerson.email;
        });

        if (hasOverride && !overrideEmail) {
            // If there's an override in the payload but not in our state
            // Use the first overridden email we find
            for (const reviewer of newPayload.reviewers) {
                const matchedPerson = mockPersons.find(p => p.name === reviewer.name);
                if (matchedPerson && reviewer.email !== matchedPerson.email) {
                    setOverrideEmail(reviewer.email);
                    break;
                }
            }
        } else if (!hasOverride && overrideEmail) {
            // Clear override if payload has no overrides
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

    const updateRequestedBy = (person: typeof mockPersons[0]) => {
        const updatedPayload = {
            ...payload,
            requestedBy: {
                name: person.name,
                email: person.email
            }
        };
        setPayload(updatedPayload);
        // Immediately update to ensure JSON editor is in sync
        handlePayloadChange(updatedPayload);
    };

    const updateRequestedFor = (person: typeof mockPersons[0]) => {
        const updatedPayload = {
            ...payload,
            requestedFor: {
                name: person.name,
                email: person.email
            }
        };
        setPayload(updatedPayload);
        // Immediately update to ensure JSON editor is in sync
        handlePayloadChange(updatedPayload);
    };

    const addReviewer = (person: typeof mockPersons[0]) => {
        // Check if this person is already in the reviewers list
        if (selectedReviewers.some(r => r.name === person.name)) {
            return; // Person is already selected
        }

        // Use the override email if it exists
        const email = overrideEmail.trim() ? overrideEmail : person.email;

        // Add the reviewer to the selected reviewers list
        const newSelectedReviewers = [...selectedReviewers, person];
        setSelectedReviewers(newSelectedReviewers);

        // Update the payload with the new reviewer
        const updatedPayload = {
            ...payload,
            reviewers: [
                ...payload.reviewers,
                {
                    name: person.name,
                    email: email
                }
            ]
        };

        setPayload(updatedPayload);
        // Immediately update to ensure JSON editor is in sync
        handlePayloadChange(updatedPayload);
    };

    const removeReviewer = (personIndex: number) => {
        // Remove from selected reviewers array
        const newSelectedReviewers = selectedReviewers.filter((_, index) => index !== personIndex);
        setSelectedReviewers(newSelectedReviewers);

        // Update the payload by removing the reviewer
        const updatedPayload = {
            ...payload,
            reviewers: payload.reviewers.filter((_, index) => index !== personIndex)
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
    };

    const updateAttempt = (value: number) => {
        // Update the local state
        setAttempt(value);

        // Create updated payload
        const updatedPayload = {
            ...payload,
            attempt: value
        };

        // Use single state update path through handlePayloadChange
        handlePayloadChange(updatedPayload);
    };

    const updateOverrideEmail = (email: string) => {
        // Update the local state
        setOverrideEmail(email);

        if (email.trim()) {
            // Apply the override email to all reviewers
            const updatedReviewers = payload.reviewers.map(reviewer => ({
                ...reviewer,
                email: email.trim()
            }));

            const updatedPayload = {
                ...payload,
                reviewers: updatedReviewers
            };

            // Update the payload and reflect changes in the JSON editor
            handlePayloadChange(updatedPayload);
        } else if (overrideEmail.trim() && !email.trim()) {
            // If clearing the override, restore the original emails
            const updatedReviewers = payload.reviewers.map(reviewer => {
                // Find the matching mock person to get their default email
                const matchedPerson = mockPersons.find(p => p.name === reviewer.name);
                return {
                    ...reviewer,
                    email: matchedPerson ? matchedPerson.email : reviewer.email
                };
            });

            const updatedPayload = {
                ...payload,
                reviewers: updatedReviewers
            };

            handlePayloadChange(updatedPayload);
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
        setResult({});

        try {
            // Create a copy of the payload for sending
            const payloadToSend = { ...payload };

            const response = await apiService.sendToReviewer(payloadToSend, token);
            setResult({
                success: true,
                message: "Feedback forms sent to reviewers successfully!",
                data: response
            });
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : "Failed to send feedback forms"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>          <PersonSelector
                label="Talent Manager"
                initialPerson={mockPersons[3]}
                onPersonChange={updateRequestedBy}
            />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Talent manager who is requesting the feedback
                </p>
            </div>
            <div>          <PersonSelector
                label="Talent"
                initialPerson={mockPersons[0]}
                onPersonChange={updateRequestedFor}
            />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    The talent being reviewed in this feedback cycle
                </p>
            </div>
        </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reviewers
                    </label>
                    <div className="flex space-x-2">
                        <select
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onChange={(e) => {
                                const selectedPerson = mockPersons.find(p => p.name === e.target.value);
                                if (selectedPerson) {
                                    addReviewer(selectedPerson);
                                }
                                e.target.value = ""; // Reset the select after adding
                            }}
                            value=""
                        >
                            <option value="" disabled>Add reviewer</option>
                            {mockPersons.map((person) => (
                                <option
                                    key={person.name}
                                    value={person.name}
                                    disabled={selectedReviewers.some(r => r.name === person.name)}
                                >
                                    {person.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    List of reviewers who will receive the feedback form
                </p>

                {selectedReviewers.length === 0 ? (
                    <div className="p-4 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">No reviewers selected</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {selectedReviewers.map((reviewer, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                                            {reviewer.name.split(' ').map(word => word[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{reviewer.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {overrideEmail.trim() ? overrideEmail : reviewer.email}
                                            {overrideEmail.trim() && (
                                                <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
                                                    Overridden
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeReviewer(index)}
                                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
                        End Date
                    </label>
                    <input
                        type="date"
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formatDateForInput(endDate)}
                        onChange={(e) => updateEndDate(e.target.value)}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        When the feedback period ends
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Attempt Count
                    </label>
                    <input
                        type="number"
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={attempt}
                        onChange={(e) => updateAttempt(parseInt(e.target.value) || 0)}
                        min={0}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Number of notification attempts
                    </p>
                </div>
            </div>

            <div className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300">
                        Override All Reviewer Emails
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
                    Override will immediately update all reviewer emails in the payload
                </div>

                {overrideEmail && (
                    <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-sm rounded flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span><span className="font-medium">Override active:</span> All reviewer emails are now set to <span className="font-mono font-medium">{overrideEmail}</span></span>
                    </div>
                )}
            </div>

            <div>
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
                <JsonEditor initialValue={payload} onChange={handlePayloadChange} />
            </div>

            <div className="flex items-center">
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="btn btn-primary mr-4"
                >
                    {isLoading ? "Sending..." : "Send Feedback Forms"}
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
