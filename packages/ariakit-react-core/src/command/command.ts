import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { isButton, isTextField } from "@ariakit/core/utils/dom";
import {
  fireClickEvent,
  isSelfTarget,
  queueBeforeEvent,
} from "@ariakit/core/utils/events";
import { isFirefox } from "@ariakit/core/utils/platform";
import type { FocusableOptions } from "../focusable/focusable.js";
import { useFocusable } from "../focusable/focusable.js";
import { useEvent, useForkRef, useTagName } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";

function isNativeClick(event: KeyboardEvent) {
  if (!event.isTrusted) return false;
  // istanbul ignore next: can't test trusted events yet
  const element = event.currentTarget;
  return (
    isButton(element) ||
    element.tagName === "SUMMARY" ||
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "A" ||
    element.tagName === "SELECT"
  );
}

/**
 * Returns props to create a `Command` component. If the element is not a native
 * clickable element (like a button), this hook will return additional props to
 * make sure it's accessible.
 * @see https://ariakit.org/components/command
 * @example
 * ```jsx
 * const props = useCommand({ as: "div" });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export const useCommand = createHook<CommandOptions>(
  ({ clickOnEnter = true, clickOnSpace = true, ...props }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const tagName = useTagName(ref, props.as);
    const type = props.type;
    const [isNativeButton, setIsNativeButton] = useState(
      () => !!tagName && isButton({ tagName, type })
    );

    useEffect(() => {
      if (!ref.current) return;
      setIsNativeButton(isButton(ref.current));
    }, []);

    const [active, setActive] = useState(false);
    const activeRef = useRef(false);
    const isDuplicate = "data-command" in props;

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDownProp?.(event);
      const element = event.currentTarget;

      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (props.disabled) return;
      if (!isSelfTarget(event)) return;
      if (isTextField(element)) return;
      if (element.isContentEditable) return;

      const isEnter = clickOnEnter && event.key === "Enter";
      const isSpace = clickOnSpace && event.key === " ";
      const shouldPreventEnter = event.key === "Enter" && !clickOnEnter;
      const shouldPreventSpace = event.key === " " && !clickOnSpace;

      if (shouldPreventEnter || shouldPreventSpace) {
        event.preventDefault();
        return;
      }

      if (isEnter || isSpace) {
        const nativeClick = isNativeClick(event);
        if (isEnter) {
          if (!nativeClick) {
            event.preventDefault();
            const { view, ...eventInit } = event;
            // Fire a click event instead of calling element.click() directly
            // so we can pass along the modifier state.
            const click = () => fireClickEvent(element, eventInit);
            // If this element is a link with target="_blank", Firefox will
            // block the "popup" if the click event is dispatched synchronously
            // or in a microtask. Queueing the event asynchronously fixes that.
            if (isFirefox()) {
              queueBeforeEvent(element, "keyup", click);
            } else {
              queueMicrotask(click);
            }
          }
        } else if (isSpace) {
          activeRef.current = true;
          if (!nativeClick) {
            event.preventDefault();
            setActive(true);
          }
        }
      }
    });

    const onKeyUpProp = props.onKeyUp;

    const onKeyUp = useEvent((event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyUpProp?.(event);

      if (event.defaultPrevented) return;
      if (isDuplicate) return;
      if (props.disabled) return;
      if (event.metaKey) return;

      const isSpace = clickOnSpace && event.key === " ";

      if (activeRef.current && isSpace) {
        activeRef.current = false;
        if (!isNativeClick(event)) {
          setActive(false);
          const element = event.currentTarget;
          const { view, ...eventInit } = event;
          queueMicrotask(() => fireClickEvent(element, eventInit));
        }
      }
    });

    props = {
      "data-command": "",
      "data-active": active ? "" : undefined,
      type: isNativeButton ? "button" : undefined,
      ...props,
      ref: useForkRef(ref, props.ref),
      onKeyDown,
      onKeyUp,
    };

    props = useFocusable(props);

    return props;
  }
);

/**
 * Renders a clickable element (like a button). If the underlying element is not
 * a native clickable element, this component will pass additional attributes to
 * make sure it's accessible.
 * @see https://ariakit.org/components/command
 * @example
 * ```jsx
 * <Command as="div">Accessible button</Command>
 * ```
 */
export const Command = createComponent<CommandOptions>((props) => {
  props = useCommand(props);
  return createElement("button", props);
});

if (process.env.NODE_ENV !== "production") {
  Command.displayName = "Command";
}

export interface CommandOptions<T extends As = "button">
  extends FocusableOptions<T> {
  /**
   * If true, pressing the enter key will trigger a click on the button.
   * @default true
   */
  clickOnEnter?: boolean;
  /**
   * If true, pressing the space key will trigger a click on the button.
   * @default true
   */
  clickOnSpace?: boolean;
}

export type CommandProps<T extends As = "button"> = Props<CommandOptions<T>>;
