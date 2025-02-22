import { useEffect, useRef } from "react";
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const ref = useRef<HTMLDetailsElement>(null);
  const dialog = Ariakit.useDialogStore();
  const mounted = dialog.useState("mounted");

  // Hydrate the dialog state. This is necessary because the user may have
  // opened the dialog before JavaScript has loaded.
  useEffect(() => dialog.setOpen(!!ref.current?.open), [dialog.setOpen]);

  return (
    <details
      ref={ref}
      open={mounted}
      onToggle={(event) => dialog.setOpen(event.currentTarget.open)}
    >
      <Ariakit.Button as="summary" className="button">
        Show modal
      </Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        // We're setting the modal prop to true only when the dialog is open and
        // JavaScript is enabled. This means that the dialog will initially have
        // a non-modal state with no backdrop element, allowing users to
        // interact with the content behind. This is necessary because, before
        // JavaScript finishes loading, we can't automatically move focus to the
        // dialog.
        modal={mounted}
        portal={false}
        hidden={false}
        className="dialog"
      >
        <Ariakit.DialogHeading className="heading">
          Success
        </Ariakit.DialogHeading>
        <p className="description">
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <div>
          <Ariakit.DialogDismiss className="button">OK</Ariakit.DialogDismiss>
        </div>
      </Ariakit.Dialog>
    </details>
  );
}
