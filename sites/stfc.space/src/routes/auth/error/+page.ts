export async function load({ url, fetch }) {
  const flowID = url.searchParams.get('flow');
  const r = await fetch(`/api/auth/self-service/errors?error=${flowID}`, {
    redirect: 'manual',
    headers: {
      'Accept': 'application/json'
    }
  });

  const e = await r.json();

  return {
    errors: e.error.message,
    flowID: flowID
  };
}
