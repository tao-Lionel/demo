const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

fs.readFile("./bookmarks_2023_8_25.html", "utf-8", function (err, dataStr) {
  if (err) {
    console.log("读取文件失败");
    return;
  }

  // 处理书签文件内容，生成 Markdown 格式
  const markdownContent = parseBookmarks(dataStr);

  // 将生成的 Markdown 内容写入文件
  fs.writeFile("bookmarks.md", markdownContent, (err) => {
    if (err) {
      console.error("写入失败:", err);
      return;
    }
    console.log("写入成功");
  });
});

// 解析书签文件并生成 Markdown 内容
function parseBookmarks(data) {
  const dom = new JSDOM(data);
  const { document } = dom.window;
  let markdownContent = "";
  const dtTags = document.querySelectorAll("DT");
  dtTags.forEach((item) => {
    console.log(item.childNodes);
    const item = item.childNodes[0];
    if (item && item?.nodeName === "H3") {
      const title = item.textContent;
      markdownContent += `
`;
      markdownContent += `## ${title}`;
      markdownContent += `

`;
    }
    if (item && item?.nodeName === "A") {
      const bookmarkName = item.textContent;
      const bookmarkLink = item.getAttribute("href");
      const bookmarkDescription = item.getAttribute("title") || "";

      markdownContent += `* [${bookmarkName}](${bookmarkLink})${bookmarkDescription}\n`;
    }
  });

  return markdownContent;
}
