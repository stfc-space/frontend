<script lang="ts">
  import { MetaTags } from 'svelte-meta-tags';

  import { _ } from 'svelte-i18n';
  import type { Twitter, OpenGraph } from 'svelte-meta-tags/types';

  export let title = $_('project.name');
  export let description = '';
  export let image = '';

  $: openGraphProps = {
    title: title,
    description: description,
    images: [{ url: image }],
    site_name: $_('project.name')
  } as OpenGraph;

  $: twitterProps = {
    title: title,
    description: description,
    image: image,
    cardType: 'summary'
  } as Twitter;
</script>

<MetaTags {title} {description} openGraph={openGraphProps} twitter={twitterProps} />
