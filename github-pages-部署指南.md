# GitHub Pages 部署指南

## 前言

本指南将帮助您将哥村卤肉饭在线点餐系统部署到GitHub Pages上，使其可以通过互联网访问。GitHub Pages是GitHub提供的一项免费静态网站托管服务，非常适合托管这类前端项目。

## 部署步骤

### 1. 创建GitHub账号

如果您还没有GitHub账号，请先前往 [GitHub官网](https://github.com/) 注册一个账号。

### 2. 创建新的GitHub仓库

1. 登录GitHub后，点击右上角的"+"图标，选择"New repository"
2. 在"Repository name"字段中输入"哥村卤肉饭"或您喜欢的名称
3. 可以选择添加描述（可选）
4. 选择仓库为"Public"（公开，这样才能使用免费的GitHub Pages）
5. 点击"Create repository"按钮创建仓库

### 3. 上传项目文件到GitHub

#### 方法一：使用Git命令行（推荐）

1. 在您的电脑上安装Git（如果尚未安装）：[下载Git](https://git-scm.com/downloads)
2. 打开命令提示符或PowerShell，进入项目文件夹：
   ```
   cd "c:\Users\腿腿\Desktop\哥村卤肉饭"
   ```
3. 初始化Git仓库并提交文件：
   ```
   git init
   git add .
   git commit -m "初始提交"
   ```
4. 连接到您的GitHub仓库并推送代码：
   ```
   git remote add origin https://github.com/您的用户名/哥村卤肉饭.git
   git branch -M main
   git push -u origin main
   ```

#### 方法二：使用GitHub Desktop（适合不熟悉命令行的用户）

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录您的GitHub账号
3. 点击"File" > "Add local repository"
4. 浏览并选择您的项目文件夹
5. 添加摘要信息并点击"Commit to main"
6. 点击"Publish repository"，选择您刚创建的仓库名称
7. 点击"Publish"按钮

### 4. 配置GitHub Pages

1. 在GitHub上打开您的仓库页面
2. 点击仓库页面顶部的"Settings"选项卡
3. 在左侧菜单中，找到并点击"Pages"选项
4. 在"Source"部分，从下拉菜单中选择"Deploy from a branch"
5. 在"Branch"下拉菜单中选择"main"，文件夹选择"/ (root)"，然后点击"Save"
6. 等待几分钟，GitHub会自动构建您的网站

### 5. 访问您的网站

部署完成后，您可以通过以下URL访问您的网站：
```
https://您的用户名.github.io/哥村卤肉饭/
```

请注意，GitHub Pages可能需要几分钟时间来部署您的网站。如果无法立即访问，请稍等片刻再试。

## 更新网站

当您对网站进行更改后，需要将更改推送到GitHub以更新已部署的网站：

### 使用Git命令行：

```
git add .
git commit -m "更新网站内容"
git push
```

### 使用GitHub Desktop：

1. 打开GitHub Desktop
2. 查看更改的文件
3. 添加提交信息。
4. 点击"Commit to main"
5. 点击"Push origin"

## 常见问题解决

### 1. 网站无法访问

- 确认您已正确配置GitHub Pages（检查仓库的Settings > Pages页面）
- 确认您的仓库是公开的（Public）
- 检查URL是否正确（注意大小写）
- 等待几分钟，GitHub Pages部署可能需要一些时间

### 2. 样式或图片无法加载

- 检查HTML文件中的路径是否正确
- 确保所有资源使用相对路径而非绝对路径
- 检查文件名大小写是否正确（GitHub Pages对大小写敏感）

### 3. 自定义域名

如果您想使用自己的域名而不是github.io域名：

1. 在仓库的Settings > Pages页面的"Custom domain"部分输入您的域名
2. 在您的域名注册商处添加相应的DNS记录：
   - 如果使用子域名（如www.example.com），添加CNAME记录指向您的用户名.github.io
   - 如果使用根域名（如example.com），添加A记录指向GitHub Pages的IP地址

## 结语

按照以上步骤，您应该能够成功将哥村卤肉饭在线点餐系统部署到GitHub Pages上。如果在部署过程中遇到任何问题，可以参考[GitHub Pages官方文档](https://docs.github.com/cn/pages)获取更多帮助。

祝您部署顺利！