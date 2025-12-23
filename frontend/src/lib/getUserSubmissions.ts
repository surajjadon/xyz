export async function getUserSubmissions() {
  // 🔥 Dummy data (same structure as real backend)
  const dummy = [
    {
      _id: "1",
      problemSlug: "two-sum",
      language: "cpp",
      status: "Accepted",
      runtime: "0.12 sec",
      memory: "32 MB",
      time: "2 min ago",
      code: `#include <bits/stdc++.h>
using namespace std;
int main() {
    cout << "Hello World";
}`,
    },
    {
      _id: "2",
      problemSlug: "reverse-string",
      language: "python",
      status: "Wrong Answer",
      runtime: "-",
      memory: "-",
      time: "10 min ago",
      code: `def solve():
    print("Hi")`,
    },
  ];

  // Simulate network delay (optional)
  await new Promise((r) => setTimeout(r, 300));

  return dummy;
}
