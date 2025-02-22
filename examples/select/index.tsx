import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const select = Ariakit.useSelectStore({
    defaultValue: "Apple",
    sameWidth: true,
    gutter: 4,
  });
  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="select" />
      <Ariakit.SelectPopover store={select} className="popover">
        <Ariakit.SelectItem className="select-item" value="Apple" />
        <Ariakit.SelectItem className="select-item" value="Banana" />
        <Ariakit.SelectItem className="select-item" value="Grape" disabled />
        <Ariakit.SelectItem className="select-item" value="Orange" />
      </Ariakit.SelectPopover>
    </div>
  );
}
