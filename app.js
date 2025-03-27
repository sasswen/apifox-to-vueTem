const express = require("express");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.set("view engine", "ejs");

// 添加中间件
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// 生成 Vue 模板的函数
const generateVueTemplate = (dynamicData) => {
  return new Promise((resolve, reject) => {
    const templatePath = path.join(__dirname, "templates", "vue-template.ejs");
    const outputPath = path.join(__dirname, "output", "dynamic-component.vue");

    ejs.renderFile(templatePath, dynamicData, (err, str) => {
      if (err) {
        console.error("生成模板时出错:", err);
        reject(err);
        return;
      }

      fs.writeFile(outputPath, str, (writeErr) => {
        if (writeErr) {
          console.error("写入文件时出错:", writeErr);
          reject(writeErr);
          return;
        }
        console.log("Vue 模板已成功生成到:", outputPath);
        resolve(str);
      });
    });
  });
};

// 添加新的路由来处理动态数据
app.post("/api/generate-template", async (req, res) => {
  const dynamicData = req.body;

  if (!dynamicData.title || !dynamicData.message) {
    return res.status(400).json({
      error: "缺少必要的字段：title 和 message",
    });
  }

  try {
    const templateContent = await generateVueTemplate(dynamicData);
    res.json({
      success: true,
      message: "模板生成成功，请在 output 目录下查看",
      data: templateContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "模板生成失败",
      error: error.message,
    });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
