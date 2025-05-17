
export interface Person {
  name: string;
  email: string;
}

export const mockPersons: Person[] = [
  {
    name: "Nikita",
    email: "nikita@mailinator.com"
  },
  {
    name: "Artsiom",
    email: "artsiom@mailinator.com"
  },
  {
    name: "Alexander",
    email: "alexander@mailinator.com"
  },
  {
    name: "Dasha",
    email: "dasha@mailinator.com"
  },
  {
    name: "Matsvei",
    email: "matsvei@mailinator.com"
  },
  {
    name: "Andrew",
    email: "andrew@mailinator.com"
  }
];

// Helper function to get person by name
export const getPersonByName = (name: string): Person | undefined => {
  return mockPersons.find(person => person.name.toLowerCase().includes(name.toLowerCase()));
};

// Helper function to get a random person
export const getRandomPerson = (): Person => {
  const randomIndex = Math.floor(Math.random() * mockPersons.length);
  return mockPersons[randomIndex];
};
