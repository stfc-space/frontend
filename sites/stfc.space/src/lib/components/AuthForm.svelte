<script lang="ts">
  import type { UiContainer, UiNode, UiNodeInputAttributes } from '@ory/client';

  import { _ } from 'svelte-i18n';

  import { Button, PasswordInput, TextInput } from '@radion/ui';
  import { getMessage } from '$lib/shared/auth/message';
  import type { FlowTypeId } from '$lib/shared/auth';

  const socialAuthBtnCls =
    'w-full inline-flex justify-center py-2 px-4 border border-light-800 dark:shadow dark:border-transparent rounded-md shadow-sm bg-white dark:bg-dark-400 text-sm font-medium text-dark-500 hover:bg-light-500 dark:text-light-200 dark:hover:bg-dark-800';

  export let authUi: UiContainer;
  export let type: FlowTypeId = null;
  export let only: string | null = null;

  const filterNodes = (authUi: UiContainer): Array<UiNode> => {
    return authUi.nodes.filter(({ group }) => {
      if (!only) {
        return true;
      }
      return group === 'default' || group === only;
    });
  };

  /*
    Populates an object for every node that was returned by Ory Kratos and sets
    its default value if there is one. Allows for easy serialization to submit via
    fetch (if JS is enabled, will revert to plain HTML form submit if it isn't)
  */
  $: filteredNodes = filterNodes(authUi);
  $: fields = filteredNodes.reduce((acc, node) => {
    const { name, value } = node.attributes as UiNodeInputAttributes;
    acc[name] = value || '';
    return acc;
  }, {});

  $: socials = authUi ? filteredNodes.filter((node) => node.group === 'oidc') : [];
  $: formErrors = authUi.messages
    ? authUi.messages.filter((m) => m.type === 'error').map((e) => getMessage(e))
    : [];
  $: formInfo = authUi.messages
    ? authUi.messages.filter((m) => m.type === 'info').map((e) => getMessage(e))
    : [];

  // $: errorString = JSON.stringify(formErrors);
</script>

<div class="flex flex-col justify-center xs:py-12 py-6 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <div
      class="
            bg-white
            dark:bg-dark-700
            py-8
            px-4
            shadow
            sm:rounded-lg
            sm:px-10
          "
    >
      <form class="space-y-6" action={authUi.action} method={authUi.method}>
        {#each filteredNodes as { messages, attributes }}
          {#if 'name' in attributes}
            <div>
              {#if attributes.type === 'email' || attributes.name === 'identifier' || attributes.name === 'traits.email'}
                <label for="email" class="block text-sm font-medium"> Email address </label>
                <TextInput
                  id="email"
                  bind:value={fields[attributes.name]}
                  name={attributes.name}
                  type="email"
                  autocomplete="email"
                  required
                  class="w-full px-3 py-2 mt-1"
                />
              {:else if attributes.name === 'traits.username'}
                <label for="password" class="block text-sm font-medium"> Username </label>
                <TextInput
                  id="username"
                  bind:value={fields[attributes.name]}
                  name={attributes.name}
                  type="text"
                  required
                  class="w-full px-3 py-2 mt-1"
                />
              {:else if attributes.name === 'password'}
                <label for="password" class="block text-sm font-medium"> Password </label>
                <PasswordInput
                  required
                  bind:value={fields[attributes.name]}
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  data-testid="auth-password"
                  class="px-3 py-2 w-full mt-1"
                />
              {:else if attributes.name === 'csrf_token'}
                <input
                  data-testid="auth-csrf"
                  value={attributes.value}
                  type="hidden"
                  name={attributes.name}
                />
              {/if}
            </div>
            {#if attributes.type === 'submit' && attributes.name !== 'provider'}
              {#if type === 'login'}
                <div class="flex items-center justify-between">
                  <!-- <div class="flex items-center">
										<Checkbox id="remember-me" name="remember-me" class="">Remember me</Checkbox>
									</div> -->

                  <div class="text-sm">
                    <a
                      href="/auth/recovery"
                      class="
                            font-medium
                            text-indigo-600
                            dark:text-purple-300
                            hover:text-indigo-500
                          "
                    >
                      {$_('auth.reset-password')}
                    </a>
                  </div>
                </div>
              {/if}

              <div>
                <Button
                  submit
                  name={attributes.name}
                  value={attributes.value}
                  class="w-full text-center flex justify-center">Sign in</Button
                >
              </div>
            {/if}
          {/if}
          <!-- Field errors -->
          {#if messages && messages.length > 0}
            {#each messages.map((m) => getMessage(m)) as message}
              {message}
            {/each}
          {/if}
        {/each}
        {#if formErrors && formErrors.length > 0}
          {#each formErrors as error}
            <p>{error}</p>
          {/each}
        {/if}
        <!-- Info -->
        {#if formInfo && formInfo.length > 0}
          {#each formInfo as info}
            <p>{info}</p>
          {/each}
        {/if}
      </form>

      {#if socials.length > 0}
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-light-900" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span
                class="
                    px-2
                    bg-white
                    dark:bg-dark-700
                    text-dark-500
                    dark:text-light-200
                  "
              >
                {$_('auth.continue-with')}
              </span>
            </div>
          </div>

          <form action={authUi.action} method={authUi.method} class="mt-6 grid grid-cols-4 gap-3">
            {#each socials as { attributes }}
              {#if 'name' in attributes}
                <button
                  type="submit"
                  name={attributes.name}
                  value={attributes.value}
                  class={socialAuthBtnCls}
                  title={attributes.value}
                >
                  <span class="sr-only">Sign in with {attributes.value}</span>

                  {#if attributes.value === 'twitch'}
                    <svg
                      role="img"
                      class="w-5 h-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      ><title>Twitch</title><path
                        d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
                      /></svg
                    >
                  {:else if attributes.value === 'github'}
                    <svg
                      role="img"
                      class="w-5 h-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      ><title>GitHub</title><path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      /></svg
                    >
                  {:else if attributes.value === 'facebook'}
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      ><title>Facebook</title><path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      /></svg
                    >
                  {:else if attributes.value === 'twitter'}
                    <svg
                      role="img"
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      ><title>Twitter</title><path
                        d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                      /></svg
                    >
                  {:else if attributes.value === 'discord'}
                    <svg
                      role="img"
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      ><title>Discord</title><path
                        d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
                      /></svg
                    >
                  {:else if attributes.value === 'apple'}
                    <svg
                      role="img"
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      ><title>Apple</title><path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      /></svg
                    >
                  {:else if attributes.value === 'google'}
                    <svg
                      role="img"
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      ><title>Google</title><path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      /></svg
                    >
                  {/if}
                </button>
              {/if}
            {/each}
          </form>
        </div>
      {/if}
      {#if type === 'login' || type === 'registration'}
        <div class="mt-6">
          <p>
            {#if type === 'login'}
              Don't have an account? <a
                class="font-medium text-indigo-600 dark:text-purple-300 hover:text-indigo-500"
                href="/auth/register">Register</a
              >
            {:else}
              Already have an account? <a
                class="font-medium text-indigo-600 dark:text-purple-300 hover:text-indigo-500"
                href="/auth/login">Sign In</a
              >
            {/if}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
