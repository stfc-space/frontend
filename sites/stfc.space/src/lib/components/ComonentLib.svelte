<script>
  import {
    Slider,
    TextInput,
    NumberInput,
    Dropdown,
    Button,
    Pagination,
    Listbox,
    Checkbox
  } from '@radion/ui';

  import { Icon } from '@steeze-ui/svelte-icon';

  import { Adjustments, Beaker, AtSymbol, Chat } from '@steeze-ui/heroicons';

  export let testText = '123';
  let sliderValue = 1;
  let sliderValue2 = 1;
  let sliderValue3 = 1;
  let sliderValueRange = [1, 15];
  let numberValue = 10;

  let checked = true;

  let listboxValue;
  let dropdownValue;
</script>

<div class="flex flex-col gap-y-2">
  <div>
    <h3>Icons</h3>
    <div class="flex flex-wrap">
      <Icon src={Adjustments} solid class="h-5 w-5" aria-hidden />
      <Icon src={Beaker} solid class="h-5 w-5" aria-hidden />
      <Icon src={AtSymbol} solid class="h-5 w-5" aria-hidden />
      <Icon src={Chat} solid class="h-5 w-5" aria-hidden />
    </div>
  </div>

  <div>
    <h3>Components</h3>
    <div class="flex items-center flex-wrap gap-y-4">
      <Pagination />
      <div class="flex gap-x-2">
        <Button class="h-8">Test</Button>
        <Button class="h-8" iconLeft={Adjustments}>Test</Button>
        <Button class="h-8" iconRight={Adjustments}>Test</Button>
      </div>
      <TextInput />
      <TextInput placeholder="Search" />
      <TextInput placeholder="Meow" bind:value={testText} />
      {testText}

      <div class="w-full">
        <NumberInput bind:value={numberValue} min={10} max={1000}>Blub</NumberInput>
        {numberValue}

        <NumberInput noButtons bind:value={numberValue} min={10} max={1000}>Blub</NumberInput>
        {numberValue}
      </div>

      <div class="w-full flex flex-col gap-y-2">
        <Listbox value={listboxValue} options={[{ value: 1 }]} />
        <Dropdown
          label="Tier"
          value={dropdownValue}
          options={[
            { name: 'All', value: -1, display: false },
            { name: 'I', value: 1, class: 'text-green-700' },
            { name: 'II', value: 1 }
          ]}
        />
      </div>
      <div class="w-full">
        <Slider min="1" max="15" bind:value={sliderValue} />
        {sliderValue}
      </div>
      <div class="w-full">
        <Slider min="1" max="15" bind:value={sliderValueRange} />
        {sliderValueRange}
      </div>
      <div class="w-full">
        <Slider min="1" max="150" noTicks bind:value={sliderValue2} />
        {sliderValue2}
      </div>
      <div class="w-full">
        <Slider min="1" max="10" noTicks smooth bind:value={sliderValue3} />
        {sliderValue3}
      </div>
      <div class="w-full">
        <Checkbox bind:checked>Magical</Checkbox>
        {checked}
      </div>
    </div>
  </div>
</div>
