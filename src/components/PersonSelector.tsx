import { useState } from 'react';
import { mockPersons } from '../data/mockPersons';
import type { Person } from '../data/mockPersons';

interface PersonSelectorProps {
  label: string;
  initialPerson: Person;
  onPersonChange: (person: Person) => void;
  overrideEmail?: string;
  isOverridden?: boolean;
}

export function PersonSelector({ 
  label, 
  initialPerson, 
  onPersonChange, 
  overrideEmail,
  isOverridden 
}: PersonSelectorProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person>(initialPerson);

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    const person = mockPersons[selectedIndex];
    setSelectedPerson(person);
    onPersonChange(person);
  };
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {isOverridden && <span className="text-blue-600 dark:text-blue-400 text-xs ml-2">(Email Overridden)</span>}
      </label>
      <select
        className={`w-full p-2 bg-white dark:bg-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isOverridden 
            ? 'border-blue-300 dark:border-blue-700' 
            : 'border-gray-300 dark:border-gray-700'
        }`}
        value={mockPersons.findIndex(p => p.email === selectedPerson.email)}
        onChange={handlePersonChange}
      >
        {mockPersons.map((person, index) => (
          <option key={person.email} value={index}>
            {person.name} ({person.email})
          </option>
        ))}
      </select>
      
      {isOverridden && overrideEmail && (
        <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
          <span className="font-medium">Using email:</span> {overrideEmail}
        </div>
      )}
    </div>
  );
}
