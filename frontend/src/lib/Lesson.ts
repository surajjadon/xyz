// src/lib/moduleApi.ts

// 1. Define the Inner Problem Details (The data inside "problemId")
export interface ModuleProblemDetails {
  _id: string;
  slug: string;
  title: string;
  difficulty: string; // "Easy", "Medium", "Hard", "Senior"
  videoUrl?: string;  // Essential for the video player
  isFree?: boolean;
  likes?: number;
  dislikes?: number;
   // For the lock icon
}

// 2. Define the Array Item (The Wrapper)
// This matches the structure: problems: [ { _id: "...", problemId: { ... } } ]
export interface ModuleItem {
  _id: string; // The ID of the link itself
  problemId: ModuleProblemDetails; // The populated actual problem data
}

// 3. Define the Main Module Shape (The Container)
export interface Module {
  _id: string;
  title: string;   // e.g., "C++ Basics"
  slug: string;    // e.g., "cpp-basics"
  sequenceIndex: number;
  problems: ModuleItem[]; // The list used for the sidebar
}

// 4. The Fetch Function
export async function getModule(slug: string): Promise<Module | null> {
  try {
    const res = await fetch(`http://localhost:5000/api/lessons/${slug}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      return json.data; 
    }
  } catch (error) {
    console.error("Module API Fetch failed, falling back to mock data", error);
  }
  return {
    _id: "mock_module_01",
    title: "C++ Basics (Mock)",
    slug: "cpp-basic",
    sequenceIndex: 1,
    problems: [
      {
        _id: "link_1",
        problemId: {
          _id: "prob_1",
          slug: "say-hello-with-cpp",
          title: "A. Say Hello With C++",
          difficulty: "Easy",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          isFree: true,
          likes: 24,
          dislikes: 10
        }
      },
      {
        _id: "link_2",
        problemId: {
          _id: "prob_2",
          slug: "area-of-circle",
          title: "E. Area of a Circle",
          difficulty: "Medium",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          isFree: false,
          likes: 15,    
            dislikes: 3
        }
      }
    ]
  };
}