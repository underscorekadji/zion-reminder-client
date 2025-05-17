## Code Standards

### TypeScript and React Patterns
- Use TypeScript interfaces/types for all props and data structures
- Follow React best practices (hooks, functional components)
- Use proper state management techniques
- Components should be modular and follow single-responsibility principle
- Always wrap component/feature into div with component/feature class name


### Styling
- You must prioritize using Tailwind CSS classes as much as possible. If needed, you may define custom Tailwind Classes / Styles. Creating custom CSS should be the last approach.

## Development Flow
- Install dependencies: `npm install`
- Development server: `npm run dev`
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`

## Repository Structure
- `entities`: Domain entities
- `shared/`: Reusable React components
  - `components/ui/`: UI components (buttons, inputs, etc.)
  - `components/lib/`: unilities
- `features/`: Features
- `public/`: Static assets
- `pages/`: Pages, one route - one page
- `widgets/`: large UI components (header, etc.)
- `README.md`: Project documentation

## Additional Rules
- Use TypeScript for all new features and modules.
- Create an `index.ts` file for each feature directory to export its components or utilities.
- Aviod using `any` type.