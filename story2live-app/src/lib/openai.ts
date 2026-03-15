import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export interface SynopsisResult {
  synopsis: string;
  themes: string[];
  arcBeginning: string;
  arcConflict: string;
  arcTurning: string;
  arcResolution: string;
  suggestedCharacters: Array<{
    name: string;
    role: string;
    description: string;
  }>;
}

export async function generateSynopsis(
  storyText: string,
  projectTitle: string,
  genre: string
): Promise<SynopsisResult> {
  const prompt = `You are a professional story analyst. Analyze the following life story and generate a structured synopsis.

Story Title: ${projectTitle}
Genre: ${genre}

Story:
${storyText}

Please provide a JSON response with exactly this structure:
{
  "synopsis": "A concise 2-3 sentence summary of the story",
  "themes": ["theme1", "theme2", "theme3"],
  "arcBeginning": "Description of the beginning/setup",
  "arcConflict": "Description of the main conflict",
  "arcTurning": "Description of the turning point",
  "arcResolution": "Description of the resolution",
  "suggestedCharacters": [
    {
      "name": "Character Name",
      "role": "protagonist|mentor|parent|friend|narrator|other",
      "description": "Brief character description"
    }
  ]
}

Themes should be single words or short phrases like: resilience, survival, family, identity, hope, courage, loss, redemption.
Return ONLY the JSON object, no other text.`;

  if (!process.env.OPENAI_API_KEY) {
    // Return a mock response if no API key is configured
    return getMockSynopsis(storyText, projectTitle);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    return JSON.parse(cleaned) as SynopsisResult;
  } catch {
    throw new Error("Failed to parse AI response");
  }
}

export async function generateStoryContent(
  synopsis: string,
  themes: string[],
  outputFormat: string,
  projectTitle: string
): Promise<string> {
  const formatInstructions: Record<string, string> = {
    book: `Generate a book outline with 5-8 chapters. For each chapter include:
- Chapter number and title
- Key events and narrative
- Character development moments
Return as JSON: { "chapters": [{ "number": 1, "title": "...", "summary": "...", "keyEvents": ["..."], "characters": ["..."] }] }`,
    movie: `Generate a screenplay structure with 3 acts. Include:
- Act descriptions
- 5-8 key scenes per act
- Dialogue suggestions
Return as JSON: { "acts": [{ "act": 1, "title": "...", "description": "...", "scenes": [{ "number": 1, "heading": "INT/EXT. LOCATION - TIME", "description": "...", "dialogue": [{ "character": "...", "line": "..." }] }] }] }`,
    documentary: `Generate a documentary script structure. Include:
- Opening narration
- 4-6 segments with narration
- Interview-style questions
Return as JSON: { "segments": [{ "number": 1, "title": "...", "narration": "...", "interviewQuestions": ["..."], "visualSuggestions": ["..."] }] }`,
  };

  const prompt = `You are a professional screenwriter and author. Based on this story synopsis, generate structured ${outputFormat} content.

Story Title: ${projectTitle}
Synopsis: ${synopsis}
Themes: ${themes.join(", ")}
Format: ${outputFormat}

${formatInstructions[outputFormat] || formatInstructions.book}

Return ONLY the JSON object, no other text.`;

  if (!process.env.OPENAI_API_KEY) {
    return getMockContent(outputFormat);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return cleaned;
}

function getMockSynopsis(storyText: string, projectTitle: string): SynopsisResult {
  const wordCount = storyText.split(" ").length;
  return {
    synopsis: `${projectTitle} tells the compelling story of a journey through adversity and triumph. The protagonist faces significant challenges that test their resolve and ultimately shapes who they become. Through resilience and determination, they forge a path toward a meaningful life.`,
    themes: ["resilience", "identity", "family", "hope", "survival"],
    arcBeginning: "The story begins with the protagonist in their formative environment, establishing the world and relationships that will define their journey.",
    arcConflict: `Major challenges arise (story contains ${wordCount} words of rich detail), creating obstacles that force the protagonist to make difficult choices.`,
    arcTurning: "A pivotal moment changes everything, pushing the protagonist toward transformation and forcing a reevaluation of their goals and values.",
    arcResolution: "The protagonist emerges changed, having overcome the central conflict and discovered a new sense of purpose and direction.",
    suggestedCharacters: [
      { name: "The Protagonist", role: "protagonist", description: "The main character whose life story drives the narrative" },
      { name: "The Mentor", role: "mentor", description: "A guiding figure who helps the protagonist navigate challenges" },
      { name: "The Companion", role: "friend", description: "A trusted friend who supports the protagonist through difficulties" },
    ],
  };
}

function getMockContent(outputFormat: string): string {
  if (outputFormat === "book") {
    return JSON.stringify({
      chapters: [
        { number: 1, title: "The Beginning", summary: "Introduction to the protagonist and their world", keyEvents: ["First scene", "Character introduction", "World building"], characters: ["Protagonist"] },
        { number: 2, title: "Rising Tensions", summary: "Challenges begin to emerge", keyEvents: ["First conflict", "Meeting allies", "Initial setback"], characters: ["Protagonist", "Mentor"] },
        { number: 3, title: "The Turning Point", summary: "Everything changes in a pivotal moment", keyEvents: ["Major revelation", "Crisis point", "Decision made"], characters: ["Protagonist"] },
        { number: 4, title: "Resolution", summary: "The story reaches its conclusion", keyEvents: ["Final challenge", "Triumph", "New beginning"], characters: ["Protagonist", "Companion"] },
      ],
    });
  } else if (outputFormat === "movie") {
    return JSON.stringify({
      acts: [
        {
          act: 1,
          title: "Setup",
          description: "Introduce the world and protagonist",
          scenes: [
            { number: 1, heading: "EXT. HOMETOWN - DAY", description: "We see the protagonist in their natural environment", dialogue: [{ character: "PROTAGONIST", line: "This is where my story begins..." }] },
          ],
        },
        {
          act: 2,
          title: "Confrontation",
          description: "The protagonist faces their greatest challenges",
          scenes: [
            { number: 2, heading: "INT. PROTAGONIST HOME - NIGHT", description: "A turning point arrives", dialogue: [{ character: "MENTOR", line: "You have the strength to overcome this." }] },
          ],
        },
        {
          act: 3,
          title: "Resolution",
          description: "The story reaches its conclusion",
          scenes: [
            { number: 3, heading: "EXT. NEW LOCATION - SUNRISE", description: "A new chapter begins", dialogue: [{ character: "PROTAGONIST", line: "I am ready for what comes next." }] },
          ],
        },
      ],
    });
  } else {
    return JSON.stringify({
      segments: [
        { number: 1, title: "Opening", narration: "Every great story begins with a single step...", interviewQuestions: ["Tell us about where you grew up", "What was your childhood like?"], visualSuggestions: ["Old photographs", "Hometown establishing shot"] },
        { number: 2, title: "The Journey", narration: "Life rarely follows the path we planned...", interviewQuestions: ["What was the biggest challenge you faced?", "How did you find the strength to continue?"], visualSuggestions: ["Archival footage", "Personal documents"] },
        { number: 3, title: "Transformation", narration: "Through hardship comes wisdom...", interviewQuestions: ["What did you learn about yourself?", "How did this experience change you?"], visualSuggestions: ["Timeline graphics", "Before and after"] },
        { number: 4, title: "Legacy", narration: "Every life story has the power to inspire others...", interviewQuestions: ["What message do you want to share?", "What are you most proud of?"], visualSuggestions: ["Present day footage", "Community impact"] },
      ],
    });
  }
}
