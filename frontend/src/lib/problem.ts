
export interface Variation {
  levelId: string;
  title: string;
  difficulty: string;
  constraints: string;
  timeLimit: string;
  memoryLimit: string;
  
  hints?: string[]; 
  testCases?: {
    input: string;
    output: string;
    explanation?: string;
  }[];

  customDescription?: string;
  extraNote?: string;
  variables?: Record<string, string>; 
}
export interface Problem {
  slug: string;
  title: string;
  tags: string[];
  
  descriptionTemplate: string; 
  inputFormat: string;
  outputFormat: string;
  likes?: number;
  dislikes?: number;
  templates?: { language: string; code: string }[];
  videoUrl: string;
  isFree: boolean;
  variations: Variation[]; 
}
export async function getProblem(slug: string): Promise<Problem | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/problems/${slug}`, {
      cache: 'no-store', 
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("API Fetch failed, falling back to mock data", error);
  }
  return {
    slug: "yet-another-gcd-problem",
    title: "Yet Another GCD Problem",
    tags: ["Math", "Number Theory", "Constructive Algorithms"],
    descriptionTemplate: "Chef is trying to solve a famous problem. Given an array A of size {{N}}, find the total number of pairs of indices (i,j) such that GCD(A[i], A[j]) = {{K}}.",
    inputFormat: "The first line contains T.\nEach test case contains a single integer {{N}}.",
    outputFormat: "Print the count of pairs.",
    likes: 120,
    dislikes: 12,
    videoUrl: "", 
    
    isFree: true,

    variations: [
      {
        levelId: "v1",
        title: "Easy Version",
        difficulty: "Easy",
        constraints: "1 ≤ T ≤ 10\n1 ≤ N ≤ 100",
        timeLimit: "2.0 Sec",
        memoryLimit: "256 MB",
        variables: { N: "100", K: "1" },
        hints: ["Try iterating through all pairs.", "Since N is small, O(N^2) is acceptable."],
        testCases: [
            { input: "1\n5", output: "10", explanation: "Since K=1, we look for coprime pairs." }
        ]
      },
      {
        levelId: "v2",
        title: "Medium Version",
        difficulty: "Medium",
        constraints: "1 ≤ T ≤ 100\n1 ≤ N ≤ 10^5",
        timeLimit: "1.0 Sec",
        memoryLimit: "256 MB",
        variables: { N: "10^5", K: "1" },
        hints: ["O(N^2) will TLE here.", "Use Euler Totient Function."],
        testCases: [
            { input: "1\n100", output: "25", explanation: "Calculated using optimized approach." }
        ]
      },
    ]
  };
}