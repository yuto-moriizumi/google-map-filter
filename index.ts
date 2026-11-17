// ==UserScript==
// @name         google-map-filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://www.google.co.jp/maps/*
// @match        https://www.google.com/maps/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mozilla.org
// @grant        none
// ==/UserScript==

const SHOW_REVIEW_COUNT_FROM = 3000;

const filterFeed = async (): Promise<void> => {
  const feed = document.querySelector("div[role='feed']");
  if (feed === null) return;
  const divs = [
    ...feed.querySelectorAll<HTMLDivElement>(
      "div[class^='Nv2PK THOPZb CpccDe'",
    ),
  ].filter((item) => {
    if (item.style.visibility === "hidden") return false;
    if (item.textContent?.includes("クチコミはありません")) return true;
    const reviewCountElm = [
      ...item.querySelectorAll("span[aria-hidden='true']"),
    ].find((elm) => elm?.textContent?.startsWith("("));
    if (reviewCountElm === undefined || reviewCountElm.textContent === null)
      return false;
    const reviewCount = parseInt(
      reviewCountElm.textContent.replaceAll(/[(),]/g, ""),
    );
    return reviewCount < SHOW_REVIEW_COUNT_FROM;
  });
  for (const item of divs) {
    item.style.visibility = "hidden";
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
};

let scheduled = false;
let running = false;
let pending = false;

const scan = async (): Promise<void> => {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  try {
    await filterFeed();
  } finally {
    running = false;
    if (pending) {
      pending = false;
      scheduleScan();
    }
  }
};

const scheduleScan = (): void => {
  if (scheduled) return;
  scheduled = true;
  requestIdleCallback(
    () => {
      scheduled = false;
      void scan();
    },
    { timeout: 200 },
  );
};

const observer = new MutationObserver(scheduleScan);
observer.observe(document.body, { childList: true, subtree: true });
scheduleScan();
