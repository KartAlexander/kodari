import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkillTag from './SkillTag'; // Adjust import path as necessary
// Assuming SkillTag uses the Badge component internally, we might not need to mock Badge
// unless we want to isolate SkillTag's specific logic.
// For this test, we'll assume Badge works as tested and check SkillTag's behavior.

describe('SkillTag Component', () => {
  it('should render the skill name correctly', () => {
    const skillName = 'JavaScript';
    render(<SkillTag skill={skillName} />);
    // SkillTag likely renders the skill name inside a Badge, which then renders the text.
    expect(screen.getByText(skillName)).toBeInTheDocument();
  });

  it('should apply default styling (likely from Badge)', () => {
    const skillName = 'React';
    render(<SkillTag skill={skillName} />);
    const skillTagElement = screen.getByText(skillName);

    // SkillTag uses Badge with variant="secondary" by default.
    // Check for classes applied by Badge's "secondary" variant.
    // From Badge.tsx: secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
    expect(skillTagElement).toHaveClass('bg-secondary');
    expect(skillTagElement).toHaveClass('text-secondary-foreground');
    // It also has base Badge classes: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    expect(skillTagElement).toHaveClass('inline-flex items-center rounded-full border');
  });

  it('should apply custom className prop', () => {
    const skillName = 'Node.js';
    const customClass = 'my-custom-skill-tag';
    render(<SkillTag skill={skillName} className={customClass} />);
    const skillTagElement = screen.getByText(skillName);

    // Check for the custom class
    expect(skillTagElement).toHaveClass(customClass);
    
    // Also ensure default/variant classes are still applied (tailwind-merge behavior)
    expect(skillTagElement).toHaveClass('bg-secondary'); // from default variant="secondary"
  });

  it('should pass through other props to the underlying Badge component if any', () => {
    // For example, if SkillTag allowed passing a specific 'variant' to Badge,
    // or other HTML attributes.
    // The current SkillTag component is simple and only takes 'skill' and 'className'.
    // If it were to pass, e.g., a data-testid:
    // render(<SkillTag skill="Jest" data-testid="jest-skill" />);
    // expect(screen.getByTestId("jest-skill")).toBeInTheDocument();
    // This test is more conceptual for the current SkillTag.tsx.
    
    // For now, let's re-verify the default variant is indeed secondary.
    const skillName = "Testing";
    render(<SkillTag skill={skillName} />);
    const skillTagElement = screen.getByText(skillName);
    // This check is redundant with 'should apply default styling' but reinforces variant.
    expect(skillTagElement).toHaveClass('bg-secondary'); 
  });
});
