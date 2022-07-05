/** Dispatch event on click outside of node */
export function clickOutside(node: HTMLElement, callbackFunction: () => void) {
  const handleClick = (event: Event & { target: HTMLElement }) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      callbackFunction();
    }
  };

  document.addEventListener('mouseup', handleClick, true);

  return {
    update(newCallbackFunction: () => void) {
      callbackFunction = newCallbackFunction;
    },
    destroy() {
      document.removeEventListener('mouseup', handleClick, true);
    }
  };
}
