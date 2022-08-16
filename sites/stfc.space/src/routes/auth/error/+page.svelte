<script lang="ts" context="module">
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
      props: {
        errors: e.error.message,
        flowID: flowID
      }
    };
  }
</script>

<script lang="ts">
  export let errors: string;
  export const flowID = '';
</script>

{errors}
