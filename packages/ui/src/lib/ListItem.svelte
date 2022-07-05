<script lang="ts">
	import { ChevronRight } from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';
</script>

<div
	class="flex items-center px-1 sm:px-3 h-full border-l-5 border-transparent hover:border-indigo-200"
>
	<div class="min-w-0 h-full flex-1 flex items-center gap-x-2">
		<slot />
	</div>

	<div class="">
		<Icon src={ChevronRight} class="h-5 w-5 text-gray-400" aria-hidden />
	</div>
</div>
