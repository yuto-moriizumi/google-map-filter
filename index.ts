// ==UserScript==
// @name         google-map-filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://www.google.co.jp/maps/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mozilla.org
// @grant        none
// ==/UserScript==

const SHOW_REVIEW_COUNT_FROM = 100;

setInterval(() => {
  const feed = document.querySelector("div[role='feed']");
  if (feed === null) return;
  [...feed.querySelectorAll<HTMLDivElement>("div[class^='Nv2PK THOPZb CpccDe'")]
    .filter((item) => {
      if (item.style.display === "none") return false;
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
    })
    .forEach((item) => {
      item.style.display = "none";
    });
}, 1000);
