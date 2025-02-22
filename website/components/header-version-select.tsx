"use client";

import { Fragment } from "react";
import { cx, invariant } from "@ariakit/core/utils/misc";
import pkg from "@ariakit/react/package.json";
import {
  Select,
  SelectArrow,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemCheck,
  SelectLabel,
  SelectPopover,
  SelectSeparator,
  useSelectStore,
} from "@ariakit/react/select";
import { NewWindow } from "icons/new-window.js";
import { React } from "icons/react.js";
import { Vue } from "icons/vue.js";
import { tw } from "utils/tw.js";
import { Link } from "./link.js";
import { Popup } from "./popup.js";

const style = {
  select: tw`
    hidden sm:flex items-center justify-center gap-1.5
    cursor-default
    px-3 h-8 mr-2
    rounded-lg border-none
    text-xs font-semibold whitespace-nowrap
    text-black/80 dark:text-white/80
    bg-black/5 dark:bg-white/5
    hover:bg-black/10 dark:hover:bg-white/10
    aria-expanded:bg-black/10 dark:aria-expanded:bg-white/10
    shadow-button dark:shadow-button-dark
    focus-visible:ariakit-outline-input
  `,
  group: tw`
    flex flex-col
  `,
  groupLabel: tw`
    flex gap-1.5 items-center
    p-1.5
    text-sm text-black/60 dark:text-white/50
    cursor-default
  `,
  item: tw`
    group
    flex items-center gap-1.5
    p-1.5
    rounded
    font-medium
    active-item:bg-blue-200/40 dark:active-item:bg-blue-600/25
    active:bg-blue-200/70 dark:active:bg-blue-800/25
  `,
  itemIcon: tw`
    w-4 h-4
    stroke-black/75 dark:stroke-white/75 group-active-item:stroke-current
  `,
  itemBadge: tw`
    p-1 px-2
    text-xs text-black/70 dark:text-white/70
    rounded-full
    bg-gray-150 dark:bg-gray-850
    group-active-item:bg-black/5 dark:group-active-item:bg-black/70
  `,
  separator: tw`
    w-full my-1.5 h-0
    border-t border-gray-250 dark:border-gray-550
  `,
};

function getValueFromPkg(pkg: { name: string; version: string }) {
  return `${pkg.name}__${pkg.version}`;
}

function getDisplayValue(version: string) {
  return `v${version}`;
}

function getPkgFromValue(value: string) {
  const [name, version] = value.split("__");
  invariant(name && version);
  return { name, version };
}

function getIcon(name: string) {
  switch (name) {
    case "@ariakit/react":
      return <React className="h-3.5 w-3.5" />;
    case "@ariakit/vue":
      return <Vue className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

function getChangeLogUrl(pkg: { name: string; version: string }) {
  const packageName = pkg.name.replace("@ariakit/", "ariakit-");
  return `https://github.com/ariakit/ariakit/blob/main/packages/${packageName}/CHANGELOG.md`;
}

interface Props {
  versions: Record<string, Record<string, string>>;
}

export function HeaderVersionSelect({ versions }: Props) {
  const select = useSelectStore({
    defaultValue: getValueFromPkg(pkg),
    gutter: 4,
    shift: -1,
  });

  const renderItem = (value: string, tag: string) => {
    const { version } = getPkgFromValue(value);

    return (
      <SelectItem key={value} value={value} className={style.item}>
        {(props) => (
          <Link href="" {...props}>
            <SelectItemCheck />
            <span className="flex-1 pr-4">{getDisplayValue(version)}</span>
            <span className={style.itemBadge}>{tag}</span>
          </Link>
        )}
      </SelectItem>
    );
  };

  const selectValue = select.useState("value");
  const selectMounted = select.useState("mounted");
  const selectedPkg = getPkgFromValue(selectValue);

  return (
    <>
      <SelectLabel store={select} hidden>
        Version
      </SelectLabel>
      <Select store={select} className={style.select}>
        {getIcon(selectedPkg.name)}
        {getDisplayValue(selectedPkg.version)}
        <SelectArrow />
      </Select>
      {selectMounted && (
        <SelectPopover store={select} as={Popup} size="small">
          {Object.entries(versions).map(([name, tags]) => (
            <Fragment key={name}>
              <SelectGroup className={style.group}>
                <SelectGroupLabel className={style.groupLabel}>
                  {getIcon(name)}
                  {name}
                </SelectGroupLabel>
                {Object.entries(tags).map(([tag, version]) =>
                  renderItem(getValueFromPkg({ name, version }), tag)
                )}
              </SelectGroup>
              <SelectSeparator className={style.separator} />
            </Fragment>
          ))}
          <SelectItem
            as="a"
            href={getChangeLogUrl(selectedPkg)}
            target="_blank"
            hideOnClick
            className={cx(style.item, "justify-between pl-[26px] font-normal")}
          >
            Changelog
            <NewWindow className={style.itemIcon} />
          </SelectItem>
        </SelectPopover>
      )}
    </>
  );
}
