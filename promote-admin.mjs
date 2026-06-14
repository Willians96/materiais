// Script to promote user to admin
// Run with: node promote-admin.mjs

const CONVEX_URL = "https://resilient-heron-594.convex.cloud"; // Production deployment

async function callMutation() {
  const email = "michel.wmoraes@gmail.com";
  
  const response = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: "users/promoteToAdmin",
      args: { email },
      isForeign: false,
    }),
  });

  const result = await response.json();
  console.log("Result:", JSON.stringify(result, null, 2));
}

callMutation().catch(console.error);