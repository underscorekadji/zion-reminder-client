
export interface Person {
  name: string;
  email: string;
}

export const mockPersons: Person[] = [
  {
    name: "Nikita",
    email: "nikita@example.com"
  },
  {
    name: "Artsiom",
    email: "artsiom@example.com"
  },
  {
    name: "Alexander",
    email: "alexander@example.com"
  },
  {
    name: "Dasha",
    email: "dasha@example.com"
  },
  {
    name: "Matsvei",
    email: "matsvei@example.com"
  },
  {
    name: "Andrew",
    email: "andrew@example.com"
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
