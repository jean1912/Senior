// src/ai/prompts.ts

export const AlgorithmDetail = (algo: {
  name: string;
  description: string;
  complexity: string;
}) => {
  return `
Algorithm Name: ${algo.name}
Description: ${algo.description}
Complexity: ${algo.complexity}
`;
};

export const AlgorithmCommands = `
Please provide:
1. A simple explanation of how it works
2. When to use this algorithm
3. A basic step-by-step breakdown
4. Real-world applications
5. Highlight the concepts asked in the question if any
6. If the algorithm doesn't match a known pattern, tell the user you cannot identify it.

Keep the explanation beginner-friendly and educational.
`;

export const ExerciseDetail = (
  exercise: { description: string },
  algorithms: { name: string; complexity: string }[],
) => {
  const algorithmList = algorithms
    .map((algo) => `- ${algo.name} (${algo.complexity})`)
    .join('\n');

  return `
Exercise Description: ${exercise.description}

Related Algorithms:
${algorithmList}
`;
};

export const ExerciseCommands = `
Generate helpful hints that guide the student without giving away the full solution.

Focus on:
1. Key concepts to consider
2. Common approaches or patterns
3. Important edge cases
4. Gentle nudges, not answers
5. Address the specific question if provided

Keep hints very short, encouraging, and educational.
`;

export const CodeReviewCommands = `
Please review this code implementation and provide constructive feedback.

Focus on:
1. Correctness of the algorithm
2. Time & space complexity analysis
3. Code quality and readability
4. Potential optimizations
5. Edge cases that might be missed
6. Respond to specific questions or context if provided

Provide educational, structured feedback.
`;
