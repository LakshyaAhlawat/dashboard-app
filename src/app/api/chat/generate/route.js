export async function POST() {
  // Legacy endpoint: no-op now that chat uses real conversations.
  return Response.json({ created: false });
}

export async function GET() {
  // Legacy endpoint: keep it as a harmless no-op.
  return Response.json({ created: false });
}
