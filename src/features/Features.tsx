import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TmNotification } from './notifications/TmNotification';
import { ReviewerNotification } from './notifications/ReviewerNotification';

// Feature interface
interface Feature {
  id: number;
  name: string;
  description: string;
}

export function Features() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(1);
  
  // Feature data
  const features: Feature[] = [
    {
      id: 1,
      name: "TM Notification",
      description: "Send automated notifications to talent mentors about starting performance review."
    },
    {
      id: 2,
      name: "Send Feedback forms to Reviewers",
      description: "Distribute feedback forms to reviewers for performance reviews."
    },
    {
      id: 3,
      name: "Mark Reviewer as filled feedback",
      description: "Update the system to indicate when a reviewer has completed and submitted their feedback form."
    },
    {
      id: 4,
      name: "Create notifications report",
      description: "Generate comprehensive reports on notification statuses, delivery rates, and recipient interactions."
    }
  ];
  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">Authentication Required</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Please log in using the button in the top right corner to access all features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">      {/* Tab Navigation */}
      <div className="flex border-b overflow-x-auto">
        {features.map((feature) => (
          <button
            key={feature.id}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === feature.id
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50"
            }`}
            onClick={() => setActiveTab(feature.id)}
          >
            {feature.name}
          </button>
        ))}
      </div>      {/* Tab Content */}
      <div className="p-8">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={activeTab === feature.id ? "block" : "hidden"}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{feature.name}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{feature.description}</p>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">              {feature.id === 1 ? (
                <TmNotification />
              ) : feature.id === 2 ? (
                <ReviewerNotification />
              ) : (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Execute this action</h3>
                  <div className="flex">
                    <button className="btn btn-primary">
                      Execute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
